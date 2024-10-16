use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{mpl_token_metadata::accounts::Metadata as MetadataAccount, Metadata},
    token::{Mint, Token, TokenAccount}
};

use crate::{constants::*, InitializeTokenPoolArgs};

#[derive(Accounts)]
#[instruction(args: InitializeTokenPoolArgs)]
pub struct InitializeTokenPool<'info> {
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
            8, // step_factor: u64
        seeds = [CONFIG_SEED, mint.key().as_ref()],
        bump
    )]
    pub token_pool_acc: Box<Account<'info, TokenPoolAcc>>,

    #[account(
        init_if_needed,
        payer = authority,
        seeds = [TOKEN_VAULT_SEED, mint.key().as_ref(), token_pool_acc.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = token_pool_acc,
    )]
    pub token_pool_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = authority,
        space = 8 + 32,
        seeds = [FEE_VAULT_SEED, token_pool_acc.key().as_ref()],
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
    pub initial_cost: u64,
    pub step_interval: u64,
    pub step_factor: u64,
}

#[account]
pub struct FeeVault {
    pub token_pool_acc: Pubkey,
}
