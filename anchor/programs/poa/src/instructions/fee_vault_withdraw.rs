use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::errors::CustomError;
use crate::state::*;
use crate::{FeeVault, TokenPoolAcc};

#[derive(Accounts)]
#[instruction(args: FeeVaultWithdrawArgs)]
pub struct FeeVaultWithdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub mint: Box<Account<'info, Mint>>,

    #[account( mut, seeds = [CONFIG_SEED, &mint.key().as_ref(), &args.token_pool_name.as_bytes()], bump )]
    pub token_pool_acc: Box<Account<'info, TokenPoolAcc>>,

    #[account(mut, seeds = [FEE_VAULT_SEED, &token_pool_acc.key().as_ref()], bump )]
    pub fee_vault: Box<Account<'info, FeeVault>>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct FeeVaultWithdrawArgs {
    pub token_pool_name: String,
    pub amount: u64,
}

pub fn fee_vault_withdraw(
    ctx: Context<FeeVaultWithdraw>,
    args: FeeVaultWithdrawArgs,
) -> Result<()> {
    let token_pool_acc = &ctx.accounts.token_pool_acc;
    let fee_vault = &mut ctx.accounts.fee_vault;
    let authority = &ctx.accounts.authority;

    // Check if the token_pool_acc approves the transaction
    require!(
        token_pool_acc.authority == authority.key(),
        CustomError::WithdrawNotApproved
    );

    // Check the pool fee vault is correct
    require!(
        token_pool_acc.pool_fee_vault == fee_vault.key(),
        CustomError::WithdrawNotApproved
    );

    // Manually check the balance of SOL in the fee_vault
    let fee_vault_balance = fee_vault.to_account_info().lamports();
    require!(
        fee_vault_balance >= args.amount,
        CustomError::InsufficientFeeVaultBalance
    );

    // Transfer SOL from fee_vault to custodian
    ctx.accounts.fee_vault.sub_lamports(args.amount)?;
    ctx.accounts.authority.add_lamports(args.amount)?;

    Ok(())
}
