use anchor_lang::prelude::*;
use anchor_spl::token;

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeTokenPoolArgs {
    initial_cost: u64,
    step_interval: u64,
    step_factor: u64,
    total_supply: u64,
}

pub fn initialize_token(
    ctx: Context<InitializeTokenPool>,
    args: InitializeTokenPoolArgs,
) -> Result<()> {
    let token_config = &mut ctx.accounts.token_pool_config;
    token_config.creator = ctx.accounts.creator.key();
    token_config.initial_cost = args.initial_cost;
    token_config.step_interval = args.step_interval;
    token_config.step_factor = args.step_factor;
    token_config.total_supply = args.total_supply;

    // Mint the total supply to the program-controlled token account
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_pool_vault.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
            &[&[
                ctx.accounts.token_pool_config.key().as_ref(),
                TOKEN_VAULT_SEED,
                &[ctx.bumps.token_pool_vault],
            ]],
        ),
        args.total_supply,
    )?;

    Ok(())
}
