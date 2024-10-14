use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{constants::*, InitializeTokenPoolArgs};

#[derive(Accounts)]
#[instruction(args: InitializeTokenPoolArgs)]
pub struct InitializeTokenPool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        seeds = [MINT_SEED, args.token_name.as_bytes()],
        bump,
        mint::decimals = 9,
        mint::authority = mint,
    )]
    pub mint: Account<'info, Mint>,

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
            9, // max_pool_cost: Option<u64>
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

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct TokenPoolAcc {
    pub authority: Pubkey,
    pub mint_address: Pubkey,
    pub pool_fee_vault: Pubkey,
    pub initial_cost: u64,
    pub step_interval: u64,
    pub step_factor: u64,
    pub max_pool_cost: Option<u64>,
}

#[account]
pub struct FeeVault {
    pub token_pool_acc: Pubkey,
}
