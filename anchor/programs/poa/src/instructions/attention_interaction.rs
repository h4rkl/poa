use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak::hashv;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::errors::CustomError;
use crate::instructions::*;
use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AttentionInteractionArgs {
    pub token_name: String,
}

#[account]
pub struct ProofAcc {
    pub authority: Pubkey,
    pub balance: u64,
    pub challenge: [u8; 32],
    pub last_hash: [u8; 32],
    pub last_proof_at: i64,
    pub token_mint: Pubkey,
    pub token_reward_vault: Pubkey,
    pub total_rewards: u64,
    pub total_proofs: u64,
}

#[derive(Accounts)]
pub struct AttentionInteraction<'info> {
    // The authority is the account that signs on behalf of the PoA application (typically via the API)
    #[account(mut)]
    pub token_pool_authority: Signer<'info>,

    // The attention authority is the account that will be paying for the transaction and receiving the attention reward
    #[account(mut)]
    pub attention_authority: Signer<'info>,

    #[account(
        init_if_needed,
        payer = attention_authority,
        space = 8 + std::mem::size_of::<ProofAcc>(),
        seeds = [PROOF_ACC_SEED, &attention_authority.key().as_ref(), &token_mint.key().as_ref()],
        bump
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

    // The ATA where the attention token reward tokens will be sent
    #[account(
        init_if_needed,
        payer = attention_authority,
        associated_token::mint = token_mint,
        associated_token::authority = attention_authority,
    )]
    pub reward_vault: Box<Account<'info, TokenAccount>>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub poa_fees: AccountInfo<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn attention_interaction(
    mut ctx: Context<AttentionInteraction>,
    args: AttentionInteractionArgs,
) -> Result<()> {
    let accs = &mut ctx.accounts;
    let bumps = &mut ctx.bumps;

    // Check poa_fees address is equal to POA_FEE_ACC
    if accs.poa_fees.key()
        != POA_FEE_ACC
            .parse::<Pubkey>()
            .map_err(|_| CustomError::InvalidPOAAcc)?
    {
        return Err(CustomError::InvalidPOAAcc.into());
    }

    // Require token name to match the token pool account
    if accs.token_pool_acc.token_name.as_str() != args.token_name.as_str() {
        return Err(CustomError::InvalidTokenPoolAccount.into());
    }

    if accs.proof_account.authority == Pubkey::default() {
        // The account was just initialized, so perform initialization logic
        initialize_proof_account(accs)?;
    }

    // Proceed with attention proof logic
    process_attention_proof(accs, bumps)?;

    Ok(())
}

fn initialize_proof_account(accs: &mut AttentionInteraction) -> Result<()> {
    let clock = Clock::get()?;

    // Transfer account fee from authority to poa_fees
    let transfer_ix = transfer(
        &accs.attention_authority.key(),
        &accs.poa_fees.key(),
        BASE_FEE,
    );
    invoke(
        &transfer_ix,
        &[
            accs.attention_authority.to_account_info(),
            accs.poa_fees.to_account_info(),
            accs.system_program.to_account_info(),
        ],
    )?;

    let proof = &mut accs.proof_account;
    proof.set_inner(ProofAcc {
        authority: accs.attention_authority.key(),
        balance: 0,
        challenge: hashv(&[
            accs.attention_authority.key().as_ref(),
            accs.token_mint.key().as_ref(),
            &clock.slot.to_le_bytes(),
        ])
        .0,
        last_hash: [0; 32],
        last_proof_at: 0,
        token_mint: accs.token_mint.key(),
        token_reward_vault: accs.reward_vault.key(),
        total_proofs: 0,
        total_rewards: 0,
    });

    Ok(())
}

fn process_attention_proof(
    accs: &mut AttentionInteraction,
    bumps: &mut AttentionInteractionBumps,
) -> Result<()> {
    let clock = Clock::get()?;
    let proof = &mut accs.proof_account;
    let token_pool_acc = &mut accs.token_pool_acc;
    let mint = accs.token_mint.key();
    let timestamp = clock.unix_timestamp;

    require!(
        token_pool_acc.authority == accs.token_pool_authority.key(),
        CustomError::InvalidTokenPoolAccount
    );

    // Verify that the timeout has passed since the last proof attempt or if it's the first proof
    if proof.last_proof_at != 0
        && timestamp - proof.last_proof_at < token_pool_acc.timeout_sec.into()
    {
        return Err(CustomError::CooldownNotMet.into());
    }

    // Calculate reward based on token pool configuration and difficulty
    let reward = token_pool_acc.reward_amount;

    if token_pool_acc.pool_fee > 0 {
        let ix_to_fee_vault = transfer(
            &accs.attention_authority.key(),
            &accs.fee_vault.key(),
            token_pool_acc.pool_fee,
        );
        invoke(
            &ix_to_fee_vault,
            &[
                accs.attention_authority.to_account_info(),
                accs.fee_vault.to_account_info(),
                accs.system_program.to_account_info(),
            ],
        )?;
    }

    let ix_to_poa_fees = transfer(
        &accs.attention_authority.key(),
        &accs.poa_fees.key(),
        TX_FEE,
    );
    invoke(
        &ix_to_poa_fees,
        &[
            accs.attention_authority.to_account_info(),
            accs.poa_fees.to_account_info(),
            accs.system_program.to_account_info(),
        ],
    )?;

    // Update proof account
    proof.last_proof_at = timestamp;
    proof.total_proofs += 1;
    proof.total_rewards += reward;

    // Transfer reward from token pool vault to attention's reward vault
    let token_pool_acc_seeds = &[CONFIG_SEED, &mint.as_ref(), &[bumps.token_pool_acc]];
    let signer_seeds = &[&token_pool_acc_seeds[..]];

    let cpi_accounts = token::Transfer {
        from: accs.token_pool_vault.to_account_info(),
        to: accs.reward_vault.to_account_info(),
        authority: accs.token_pool_acc.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        accs.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );
    token::transfer(cpi_ctx, reward)?;

    Ok(())
}
