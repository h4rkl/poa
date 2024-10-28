use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::errors::CustomError;
use crate::instructions::*;
use crate::state::*;

#[derive(Accounts)]
pub struct AttentionProof<'info> {
    // The authority is the account that signs on behalf of the PoA application (typically via the API)
    #[account(mut)]
    pub token_pool_authority: Signer<'info>,

    // The attention authority is the account that will be paying for the transaction and receiving the attention reward
    #[account(mut)]
    pub attention_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [PROOF_ACC_SEED, &attention_authority.key().as_ref(), &token_mint.key().as_ref()],
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

    // The fee vault where the rewards are collected for the project
    #[account( mut, seeds = [FEE_VAULT_SEED, &token_pool_acc.key().as_ref()], bump )]
    pub fee_vault: Account<'info, FeeVault>,

    // The reward vault for the user account
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = attention_authority
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub poa_fees: AccountInfo<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn attention_proof(ctx: Context<AttentionProof>) -> Result<()> {
    let clock = Clock::get()?;
    let proof = &mut ctx.accounts.proof_account;
    let token_pool_acc = &mut ctx.accounts.token_pool_acc;
    let mint = ctx.accounts.token_mint.key();
    let timestamp = clock.unix_timestamp;

    require!(
        token_pool_acc.authority == ctx.accounts.token_pool_authority.key(),
        CustomError::InvalidTokenPoolAccount
    );

    // Verify that the timeout has passed since the last proof attempt
    if timestamp - proof.last_proof_at < token_pool_acc.timeout_sec.into() {
        return Err(CustomError::CooldownNotMet.into());
    }

    // Calculate reward based on token pool configuration and difficulty
    let reward = token_pool_acc.reward_amount;

    // Create instruction data
    let ix_to_fee_vault = transfer(
        &ctx.accounts.attention_authority.key(),
        &ctx.accounts.fee_vault.key(),
        token_pool_acc.pool_fee,
    );
    let ix_to_poa_fees = transfer(
        &ctx.accounts.attention_authority.key(),
        &ctx.accounts.poa_fees.key(),
        TX_FEE,
    );

    // Invoke both transfers
    invoke(
        &ix_to_fee_vault,
        &[
            ctx.accounts.attention_authority.to_account_info(),
            ctx.accounts.fee_vault.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    invoke(
        &ix_to_poa_fees,
        &[
            ctx.accounts.attention_authority.to_account_info(),
            ctx.accounts.poa_fees.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Update proof account
    proof.last_proof_at = timestamp;
    proof.total_proofs += 1;
    proof.total_rewards += reward;

    // Transfer reward from token pool vault to attention's reward vault
    let token_pool_acc_seeds = &[
        CONFIG_SEED,
        &mint.as_ref(),
        &[ctx.bumps.token_pool_acc],
    ];
    let signer_seeds = &[&token_pool_acc_seeds[..]];

    let cpi_accounts = token::Transfer {
        from: ctx.accounts.token_pool_vault.to_account_info(),
        to: ctx.accounts.reward_vault.to_account_info(),
        authority: ctx.accounts.token_pool_acc.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );
    token::transfer(cpi_ctx, reward)?;

    Ok(())
}
