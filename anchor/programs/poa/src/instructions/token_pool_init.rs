use anchor_lang::{prelude::*, solana_program::{program::invoke, system_instruction::transfer}};
use anchor_spl::{
    metadata::{
        create_metadata_accounts_v3, 
        mpl_token_metadata::types::DataV2, 
        CreateMetadataAccountsV3, 
        mpl_token_metadata::accounts::Metadata as MetadataAccount, 
        Metadata
    },
    token::{self, Mint, Token, TokenAccount},
    token::spl_token::instruction::AuthorityType::MintTokens,
};

use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(args: TokenPoolInitArgs)]
pub struct TokenPoolInit<'info> {
    // The authority is the account that signs on behalf of the PoA application (typically via the API)
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        seeds = [MINT_SEED, &args.token_name.as_bytes()],
        bump,
        mint::decimals = args.token_decimals,
        mint::authority = mint,
    )]
    pub mint: Box<Account<'info, Mint>>,

    ///CHECK: Using "address" constraint to validate metadata account address
    #[account(mut, address = MetadataAccount::find_pda(&mint.key()).0)]
    pub metadata_account: UncheckedAccount<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<TokenPoolAcc>(),
        seeds = [CONFIG_SEED, &mint.key().as_ref()],
        bump
    )]
    pub token_pool_acc: Box<Account<'info, TokenPoolAcc>>,

    #[account(
        init,
        payer = authority,
        seeds = [TOKEN_VAULT_SEED, &mint.key().as_ref(), &token_pool_acc.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = token_pool_acc,
    )]
    pub token_pool_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<FeeVault>(),
        seeds = [FEE_VAULT_SEED, &token_pool_acc.key().as_ref()],
        bump
    )]
    pub fee_vault: Box<Account<'info, FeeVault>>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub poa_fees: AccountInfo<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct TokenPoolAcc {
    // The authority is the account that signs on behalf of the PoA application (typically via the API) and has withdraw authority over the token pool fee vault
    pub authority: Pubkey,
    // The unique token name for the token pool
    pub token_name: String,
    pub mint_address: Pubkey,
    // The vault where the pool fees are collected for distribution
    pub pool_fee_vault: Pubkey,
    // The fixed amount of tokens to be rewarded for attention proofs
    pub reward_amount: u64,
    // The SOL fee to be collected by the pool for distributing rewards
    pub pool_fee: u64,
    // The timeout for the attention proof
    pub timeout_sec: u32,
}

#[account]
pub struct FeeVault {
    pub token_pool_acc: Pubkey,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct TokenPoolInitArgs {
    reward_amount: u64,
    pool_fee: u64,
    timeout_sec: u32,
    symbol: String,
    pub token_decimals: u8,
    pub token_name: String,
    total_supply: u64,
    uri: String,
}

pub fn token_pool_init(
    ctx: Context<TokenPoolInit>,
    args: TokenPoolInitArgs,
) -> Result<()> {
    let TokenPoolInitArgs {
        reward_amount,
        pool_fee,
        timeout_sec,
        symbol,
        token_decimals: _,
        token_name,
        total_supply,
        uri,
    } = args;

    let token_pool_acc = &mut ctx.accounts.token_pool_acc;

    // Check poa_fees address is equal to POA_FEE_ACC
    if ctx.accounts.poa_fees.key()
        != POA_FEE_ACC
            .parse::<Pubkey>()
            .map_err(|_| CustomError::InvalidPOAAcc)?
    {
        return Err(CustomError::InvalidPOAAcc.into());
    }

    // Creating token pool account
    token_pool_acc.set_inner(TokenPoolAcc {
        authority: ctx.accounts.authority.key(),
        token_name: token_name.clone(),
        mint_address: ctx.accounts.mint.key(),
        pool_fee_vault: ctx.accounts.fee_vault.key(),
        reward_amount,
        pool_fee,
        timeout_sec,
    });

    // Transfer account fee from authority to poa_fees
    let transfer_ix = transfer(
        &ctx.accounts.authority.key(),
        &ctx.accounts.poa_fees.key(),
        BASE_FEE,
    );
    invoke(
        &transfer_ix,
        &[
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.poa_fees.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Mint the total supply to the token_pool authority
    let mint_signer_seeds: &[&[&[u8]]] = &[&[MINT_SEED, &token_name.as_ref(), &[ctx.bumps.mint]]];

    // On-chain token metadata for the mint
    let data_v2 = DataV2 {
        name: token_name.clone(),
        symbol,
        uri,
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    // CPI Context
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            mint_authority: ctx.accounts.mint.to_account_info(),
            payer: ctx.accounts.authority.to_account_info(),
            update_authority: ctx.accounts.mint.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        },
        mint_signer_seeds,
    );
    create_metadata_accounts_v3(cpi_ctx, data_v2, false, true, None)?;

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_pool_vault.to_account_info(),
                authority: ctx.accounts.mint.to_account_info(),
            },
            mint_signer_seeds,
        ),
        total_supply,
    )?;

    token::set_authority(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::SetAuthority {
                current_authority: ctx.accounts.mint.to_account_info(),
                account_or_mint: ctx.accounts.mint.to_account_info(),
            },
            mint_signer_seeds,
        ),
        MintTokens,
        None,
    )?;

    Ok(())
}
