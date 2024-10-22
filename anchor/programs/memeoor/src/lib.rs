use anchor_lang::prelude::*;
use instructions::*;

pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("CLiCKaKS3DZUCr9WazTnXSM1Tky7kgrKy6tDQ2tSeZ9P");

#[program]
pub mod memeoor {
    use super::*;

    pub fn token_pool_initialise(
        ctx: Context<TokenPoolInit>,
        args: TokenPoolInitArgs,
    ) -> Result<()> {
        token_pool_init(ctx, args)
    }

    pub fn attention_initialise(
        ctx: Context<AttentionInit>,
        args: AttentionInitArgs,
    ) -> Result<()> {
        attention_init(ctx, args)
    }

    pub fn attention_prove(ctx: Context<AttentionProof>) -> Result<()> {
        attention_proof(ctx)
    }
}
