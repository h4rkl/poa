use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        create_metadata_accounts_v3, 
        mpl_token_metadata::types::DataV2, 
        CreateMetadataAccountsV3, 
        mpl_token_metadata::accounts::Metadata as MetadataAccount, 
        Metadata
    },
    token::{self, Mint, Token, TokenAccount},
};

use crate::state::*;

#[derive(Accounts)]
#[instruction(args: TokenPoolInitArgs)]
pub struct TokenPoolInit<'info> {
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
        space = 
            8 + // discriminator
            32 + // authority: Pubkey
            32 + // mint_address: Pubkey
            32 + // pool_fee_vault: Pubkey
            8 + // initial_cost: u64
            8 + // step_interval: u64
            8 + // step_factor: u64
            8 + // difficulty: u64
            8, // last_difficulty_adjustment: i64
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

    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct TokenPoolAcc {
    pub authority: Pubkey,
    pub mint_address: Pubkey,
    pub pool_fee_vault: Pubkey,
    // The initial cost for mining
    pub initial_cost: u64,
    // The interval at which the mining cost increases
    pub step_interval: u64,
    // The factor by which the mining cost increases after each step
    pub step_factor: u64,
    // The difficulty for mining
    pub difficulty: u64,
    // The timestamp of the last difficulty adjustment
    pub last_difficulty_adjustment: i64,
}

#[account]
pub struct FeeVault {
    pub token_pool_acc: Pubkey,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct TokenPoolInitArgs {
    initial_cost: u64,
    step_factor: u64,
    step_interval: u64,
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
        initial_cost,
        step_factor,
        step_interval,
        symbol,
        token_decimals: _,
        token_name,
        total_supply,
        uri,
    } = args;

    let token_pool_acc = &mut ctx.accounts.token_pool_acc;

    // Creating token pool account
    token_pool_acc.set_inner(TokenPoolAcc {
        authority: ctx.accounts.authority.key(),
        mint_address: ctx.accounts.mint.key(),
        pool_fee_vault: ctx.accounts.fee_vault.key(),
        initial_cost,
        step_interval,
        step_factor,
        difficulty: 0,
        last_difficulty_adjustment: Clock::get().unwrap().slot.try_into().unwrap(),
    });

    // Mint the total supply to the token_pool authority
    let mint_signer_seeds: &[&[&[u8]]] = &[&[MINT_SEED, &token_name.as_ref(), &[ctx.bumps.mint]]];

    // fn truncate_symbol(symbol: &str) -> String {
    //     symbol.chars().take(200).collect::<String>()
    // }
    // msg!("*****************symbol: {}", truncate_symbol(&symbol));
    // msg!("*****************uri: {}", truncate_symbol(&uri));
    // msg!("*****************name: {}", truncate_symbol(&token_name));

    // On-chain token metadata for the mint
    let data_v2 = DataV2 {
        name: token_name.clone(),
        // symbol,
        // uri,
        symbol: "CLICK".to_string(),
        uri: "https://raw.githubusercontent.com/zetamarkets/brand/master/token/zex.json"
            .to_string(),
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

    create_metadata_accounts_v3(cpi_ctx, data_v2, true, true, None)?;

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

    Ok(())
}
