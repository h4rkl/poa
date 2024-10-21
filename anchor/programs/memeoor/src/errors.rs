use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("Invalid pool token account.")]
    InvalidTokenPoolAccount,
    #[msg("Invalid pool address.")]
    InvalidPoolAddress,
    #[msg("Mining cooldown not met.")]
    MiningCooldownNotMet,
    #[msg("Invalid hash provided.")]
    InvalidHash,
    #[msg("Hash not below difficulty target.")]
    HashNotBelowDifficulty,
}