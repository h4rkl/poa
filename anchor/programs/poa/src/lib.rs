use anchor_lang::prelude::*;
use instructions::*;

pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("attnSvJ4JWmqnRT6Hx1rWDtpKRgthJBhXeGQigcC1Mi");

#[program]
pub mod poa {
    use super::*;

    pub fn token_pool_initialise(
        ctx: Context<TokenPoolInit>,
        args: TokenPoolInitArgs,
    ) -> Result<()> {
        token_pool_init(ctx, args)
    }

    pub fn attention_interact(
        ctx: Context<AttentionInteraction>,
        args: AttentionInteractionArgs,
    ) -> Result<()> {
        attention_interaction(ctx, args)
    }

    pub fn fee_vault_withdraw_funds(ctx: Context<FeeVaultWithdraw>, args: FeeVaultWithdrawArgs) -> Result<()> {
        fee_vault_withdraw(ctx, args)
    }
}
