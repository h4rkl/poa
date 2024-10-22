use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::{keccak::hashv, system_instruction::transfer};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::errors::CustomError;
use crate::state::*;

#[derive(Accounts)]
#[instruction(args: AttentionInitArgs)]
pub struct AttentionInit<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account( seeds = [MINT_SEED, &args.token_name.as_bytes()], bump, )]
    pub token_mint: Box<Account<'info, Mint>>,

    // The ATA where the attention token reward tokens will be sent
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = token_mint,
        associated_token::authority = authority,
    )]
    pub reward_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<ProofAcc>(),
        seeds = [PROOF_ACC_SEED, &authority.key().as_ref(), &token_mint.key().as_ref()],
        bump
    )]
    pub proof_account: Box<Account<'info, ProofAcc>>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub poa_fees: AccountInfo<'info>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AttentionInitArgs {
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

pub fn attention_init(ctx: Context<AttentionInit>, _args: AttentionInitArgs) -> Result<()> {
    let clock = Clock::get()?;

    // Check poa_fees address is equal to POA_FEE_ACC
    if ctx.accounts.poa_fees.key()
        != POA_FEE_ACC
            .parse::<Pubkey>()
            .map_err(|_| CustomError::InvalidPOAAcc)?
    {
        return Err(CustomError::InvalidPOAAcc.into());
    }

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

    let proof = &mut ctx.accounts.proof_account;
    proof.set_inner(ProofAcc {
        authority: ctx.accounts.authority.key(),
        balance: 0,
        challenge: hashv(&[
            ctx.accounts.authority.key().as_ref(),
            ctx.accounts.token_mint.key().as_ref(),
            &clock.slot.to_le_bytes(),
        ])
        .0,
        last_hash: [0; 32],
        last_proof_at: clock.unix_timestamp,
        token_mint: ctx.accounts.token_mint.key(),
        token_reward_vault: ctx.accounts.reward_vault.key(),
        total_proofs: 0,
        total_rewards: 0,
    });

    Ok(())
}
