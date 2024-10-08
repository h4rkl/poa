use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};

use crate::constants::*;

#[derive(Accounts)]
pub struct InitializeTokenMining<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + // discriminator
                32 + // mint_address: Pubkey
                32 + // creator: Pubkey
                8 + // initial_cost: u64
                8 + // step_interval: u64
                8 + // step_factor: u64
                8 + // max_mining_cost: Option<u64>
                8 + // total_supply: u64
                8 + // mined_tokens: u64
                32 + // mining_fee_vault: Pubkey
                8 + // liquidity_threshold: u64
                32, // liquidity_pool_address: Pubkey
        seeds = [mint.key().as_ref(), CONFIG_SEED],
        bump
    )]
    pub token_mining_config: Account<'info, TokenMiningConfig>,

    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        seeds = [token_mining_config.key().as_ref(), TOKEN_VAULT_SEED],
        bump,
        token::mint = mint,
        token::authority = token_mining_config,
    )]
    pub mining_fee_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        space = 8 + 8 + 32,
        seeds = [token_mining_config.key().as_ref(), FEE_VAULT_SEED],
        bump
    )]
    pub fee_vault: Account<'info, FeeVault>,

    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct TokenMiningConfig {
    pub mint_address: Pubkey,
    pub creator: Pubkey,
    pub initial_cost: u64,
    pub step_interval: u64,
    pub step_factor: u64,
    pub max_mining_cost: Option<u64>,
    pub total_supply: u64,
    pub mined_tokens: u64,
    pub mining_fee_vault: Pubkey,
    pub liquidity_threshold: u64,
    pub liquidity_pool_address: Pubkey,
}

#[account]
pub struct FeeVault {
    pub total_fees_collected: u64,
    pub liquidity_pool_address: Pubkey,
}