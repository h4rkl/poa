use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak::hashv;
use anchor_lang::system_program::transfer;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::errors::CustomError;
use crate::instructions::*;
use crate::state::*;

#[derive(Accounts)]
pub struct MineTokenPool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [PROOF_ACC_SEED, &authority.key().as_ref(), &token_mint.key().as_ref()],
        bump,
    )]
    pub proof_account: Account<'info, ProofAcc>,

    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [CONFIG_SEED, &token_mint.key().as_ref()],
        bump
    )]
    pub token_pool_acc: Account<'info, TokenPoolAcc>,

    #[account(
        mut,
        seeds = [TOKEN_VAULT_SEED, &token_mint.key().as_ref(), &token_pool_acc.key().as_ref()],
        bump
    )]
    pub token_pool_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [FEE_VAULT_SEED, &token_pool_acc.key().as_ref()],
        bump
    )]
    pub fee_vault: Account<'info, FeeVault>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = authority
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn mine_token_pool(ctx: Context<MineTokenPool>, provided_hash: [u8; 32]) -> Result<()> {
    let clock = Clock::get()?;
    let proof = &mut ctx.accounts.proof_account;
    let token_pool_acc = &mut ctx.accounts.token_pool_acc;

    // Verify that at least one minute has passed since the last mining attempt
    if clock.unix_timestamp - proof.last_hash_at < 60 {
        return Err(CustomError::MiningCooldownNotMet.into());
    }

    // Verify the provided hash
    let expected_hash = hashv(&[
        &proof.challenge,
        &proof.last_hash,
        &clock.slot.to_le_bytes(),
    ])
    .0;

    if provided_hash != expected_hash {
        return Err(CustomError::InvalidHash.into());
    }

    // Check if the provided hash is below the difficulty target
    if !check_difficulty(&provided_hash, token_pool_acc.difficulty) {
        return Err(CustomError::HashNotBelowDifficulty.into());
    }

    // Calculate reward based on token pool configuration and difficulty
    let reward = calculate_reward(token_pool_acc, proof.total_hashes);

    // Calculate SOL fee based on initial_cost
    let sol_fee = token_pool_acc.initial_cost;

    // Transfer SOL fee from miner to fee_receiver
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: ctx.accounts.authority.to_account_info(),
            to: ctx.accounts.fee_vault.to_account_info(),
        },
    );
    transfer(cpi_context, sol_fee)?;

    // Update miner proof
    proof.last_hash = provided_hash;
    proof.last_hash_at = clock.unix_timestamp;
    proof.total_hashes += 1;
    proof.total_rewards += reward;

    // Generate new challenge
    proof.challenge = hashv(&[&provided_hash, &clock.slot.to_le_bytes()]).0;

    // Transfer reward from token pool vault to miner's reward vault
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.token_pool_vault.to_account_info(),
        to: ctx.accounts.reward_vault.to_account_info(),
        authority: ctx.accounts.token_pool_acc.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, reward)?;

    // Adjust difficulty every 10 minutes (600 seconds)
    if clock.unix_timestamp - token_pool_acc.last_difficulty_adjustment >= 600 {
        adjust_difficulty(token_pool_acc, clock.unix_timestamp);
    }

    Ok(())
}

fn calculate_reward(token_pool_acc: &TokenPoolAcc, total_hashes: u64) -> u64 {
    let base_reward = token_pool_acc.initial_cost;
    let steps = total_hashes / token_pool_acc.step_interval;
    let factor = (100 + token_pool_acc.step_factor).pow(steps as u32) / 100u64.pow(steps as u32);

    // Include difficulty in reward calculation
    let difficulty_factor = (token_pool_acc.difficulty as f64).log2() / 10.0;
    let difficulty_multiplier = 1.0 + difficulty_factor;

    ((base_reward * factor) as f64 * difficulty_multiplier) as u64
}

fn check_difficulty(hash: &[u8; 32], difficulty: u64) -> bool {
    let hash_value = u64::from_be_bytes(hash[0..8].try_into().unwrap());
    hash_value < difficulty
}

fn adjust_difficulty(token_pool_acc: &mut TokenPoolAcc, current_timestamp: i64) {
    let time_elapsed = current_timestamp - token_pool_acc.last_difficulty_adjustment;
    let expected_time = TIME_DIFFICULTY_ADJUSTMENT;

    if time_elapsed < expected_time / 2 {
        token_pool_acc.difficulty = token_pool_acc
            .difficulty
            .saturating_add(token_pool_acc.difficulty / 10);
    } else if time_elapsed > expected_time * 2 {
        token_pool_acc.difficulty = token_pool_acc
            .difficulty
            .saturating_sub(token_pool_acc.difficulty / 10);
    }

    token_pool_acc.last_difficulty_adjustment = current_timestamp;
}
