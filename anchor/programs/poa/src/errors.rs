use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("Invalid pool token account.")]
    InvalidTokenPoolAccount,
    #[msg("Invalid pool address.")]
    InvalidPoolAddress,
    #[msg("Cooldown not met.")]
    CooldownNotMet,
    #[msg("Invalid hash provided.")]
    InvalidHash,
    #[msg("Invalid POA fee acc.")]
    InvalidPOAAcc,
    #[msg("Withdraw not approved.")]
    WithdrawNotApproved,
    #[msg("Insufficient fee vault balance.")]
    InsufficientFeeVaultBalance,
    #[msg("Input string too long.")]
    StringTooLong,
    #[msg("Validation failed.")]
    ValidationFailed,
}