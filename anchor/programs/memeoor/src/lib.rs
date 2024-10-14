use anchor_lang::prelude::*;
use instructions::*;
use state::*;

pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("memev6gnPZhMteK2mQ2GXpHv6ZNtCFJsbzbhG3A3T1m");

#[program]
pub mod memeoor {
    use super::*;

    pub fn initialize_token(
        ctx: Context<InitializeTokenPool>,
        args: InitializeTokenPoolArgs,
    ) -> Result<()> {
        token_pool::initialize_token(ctx, args)
    }

    // pub fn claim_tokens(ctx: Context<ClaimTokens>, amount: u64) -> Result<()> {
    //     let user_claim = &mut ctx.accounts.user_claim;
    //     let mint = ctx.accounts.mint.key();

    //     require!(!user_claim.has_claimed, CustomError::AlreadyClaimed);
    //     require!(amount > 1_000_000_000, CustomError::InvalidAmount);

    //     // Transfer tokens
    //     let cpi_accounts = Transfer {
    //         from: ctx.accounts.pool_token_account.to_account_info(),
    //         to: ctx.accounts.user_token_account.to_account_info(),
    //         authority: ctx.accounts.pool_authority.to_account_info(),
    //     };
    //     let cpi_program = ctx.accounts.token_program.to_account_info();
    //     let seeds = &[
    //         mint.as_ref(),
    //         &[ctx.bumps.pool_authority],
    //     ];
    //     let signer = &[&seeds[..]];

    //     token::transfer(
    //         CpiContext::new_with_signer(cpi_program, cpi_accounts, signer),
    //         amount,
    //     )?;

    //     user_claim.has_claimed = true;

    //     Ok(())
    // }
}
