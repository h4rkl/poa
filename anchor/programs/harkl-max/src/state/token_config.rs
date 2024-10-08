use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};

pub const TOKEN_MINING_PROTOCOL: &[u8] = b"TOKEN_MINING_PROTOCOL";

#[derive(Accounts)]
pub struct InitializeTokenMining<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 32 + 8 + 32,
        seeds = [b"config", mint.key().as_ref(), TOKEN_MINING_PROTOCOL],
        bump
    )]
    pub token_mining_config: Account<'info, TokenMiningConfig>,

    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        seeds = [b"token_vault", token_mining_config.key().as_ref(), TOKEN_MINING_PROTOCOL],
        bump,
        token::mint = mint,
        token::authority = token_mining_config,
    )]
    pub mining_fee_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        space = 8 + 8 + 32,
        seeds = [b"fee_vault", token_mining_config.key().as_ref(), TOKEN_MINING_PROTOCOL],
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