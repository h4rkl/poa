use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction::transfer},
};
use anchor_spl::{
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::accounts::Metadata as MetadataAccount,
        mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3, Metadata,
    },
    token::spl_token::instruction::AuthorityType::MintTokens,
    token::{self, Mint, Token, TokenAccount},
};

use crate::errors::*;
use crate::state::*;

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
        space = TokenPoolAcc::size(&args.token_name),
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
        space = 8 + 32,
        seeds = [FEE_VAULT_SEED, &token_pool_acc.key().as_ref()],
        bump
    )]
    pub fee_vault: Box<Account<'info, FeeVault>>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub poa_fees: UncheckedAccount<'info>,

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

impl TokenPoolAcc {
    pub fn size(token_name: &String) -> usize {
        8 +  // discriminator
        32 + // authority (Pubkey)
        4 + token_name.len() + // token_name (String has 4-byte length prefix)
        32 + // mint_address (Pubkey)
        32 + // pool_fee_vault (Pubkey)
        8 +  // reward_amount (u64)
        8 +  // pool_fee (u64)
        4 // timeout_sec (u32)
    }

    pub fn validate(&self) -> Result<()> {
        require!(
            self.token_name.len() <= MAX_NAME_LENGTH,
            CustomError::StringTooLong
        );
        Ok(())
    }
}

#[account]
pub struct FeeVault {
    pub token_pool_acc: Pubkey, // 32 bytes
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct TokenMetadataArgs {
    pub symbol: String,
    pub uri: String,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct TokenPoolInitArgs {
    pub pool_fee: u64,
    pub reward_amount: u64,
    pub symbol: Box<String>,
    pub timeout_sec: u32,
    pub token_decimals: u8,
    pub token_name: Box<String>,
    pub total_supply: u64,
    pub uri: Box<String>,
}

impl TokenPoolInitArgs {
    pub fn validate(&self) -> Result<()> {
        if self.token_name.len() > MAX_NAME_LENGTH
            || self.symbol.len() > MAX_SYMBOL_LENGTH
            || self.uri.len() > MAX_URI_LENGTH
        {
            return Err(CustomError::StringTooLong.into());
        }
        Ok(())
    }
}

pub fn token_pool_init(ctx: Context<TokenPoolInit>, args: TokenPoolInitArgs) -> Result<()> {
    ctx.accounts.token_pool_acc.validate()?;
    args.validate()?;
    // Check poa_fees address is equal to POA_FEE_ACC
    if ctx.accounts.poa_fees.key()
        != POA_FEE_ACC
            .parse::<Pubkey>()
            .map_err(|_| CustomError::InvalidPOAAcc)?
    {
        return Err(CustomError::InvalidPOAAcc.into());
    }

    // Set token pool account data directly without intermediate variables
    ctx.accounts.token_pool_acc.set_inner(TokenPoolAcc {
        authority: ctx.accounts.authority.key(),
        token_name: *args.token_name.clone(),
        mint_address: ctx.accounts.mint.key(),
        pool_fee_vault: ctx.accounts.fee_vault.key(),
        reward_amount: args.reward_amount,
        pool_fee: args.pool_fee,
        timeout_sec: args.timeout_sec,
    });

    // Process fee transfer
    invoke(
        &transfer(
            &ctx.accounts.authority.key(),
            &ctx.accounts.poa_fees.key(),
            BASE_FEE,
        ),
        &[
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.poa_fees.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Create mint signer seeds without intermediate string allocations
    let mint_signer_seeds: &[&[&[u8]]] =
        &[&[MINT_SEED, args.token_name.as_bytes(), &[ctx.bumps.mint]]];

    // Create metadata directly without intermediate variables
    create_metadata_accounts_v3(
        CpiContext::new_with_signer(
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
        ),
        DataV2 {
            name: *args.token_name.clone(),
            symbol: *args.symbol.clone(),
            uri: *args.uri.clone(),
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        false,
        true,
        None,
    )?;

    // Mint tokens
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
        args.total_supply,
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
