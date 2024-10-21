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

    pub fn token_pool_initialise(
        ctx: Context<TokenPoolInit>,
        args: TokenPoolInitArgs,
    ) -> Result<()> {
        token_pool_init(ctx, args)
    }

    pub fn attention_initialise(ctx: Context<AttentionInit>, args: AttentionInitArgs) -> Result<()> {
        attention_init(ctx, args)
    }
}
