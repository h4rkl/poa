use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction::transfer},
};
use anchor_spl::token::{spl_token, Mint, Token, TokenAccount};

use crate::errors::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(args: TokenPoolInitArgs)]
pub struct TokenPoolInit<'info> {
    // The authority is the account that signs on behalf of the PoA application (typically via the API)
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut, token::mint = mint, constraint = authority_token_account.owner == authority.key())]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = authority,
        space = TokenPoolAcc::size(&args.token_pool_name),
        seeds = [CONFIG_SEED, &mint.key().as_ref(), &args.token_pool_name.as_bytes()],
        bump
    )]
    pub token_pool_acc: Box<Account<'info, TokenPoolAcc>>,

    #[account(
        init,
        payer = authority,
        seeds = [TOKEN_VAULT_SEED, &mint.key().as_ref(), &token_pool_acc.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = token_pool_acc,
    )]
    pub token_pool_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = authority,
        space = 8 + 32,
        seeds = [FEE_VAULT_SEED, &token_pool_acc.key().as_ref()],
        bump
    )]
    pub fee_vault: Box<Account<'info, FeeVault>>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account( mut, constraint = poa_fees.key() == POA_FEE_ACC.parse::<Pubkey>().map_err(|_| CustomError::InvalidPOAAcc)? )]
    pub poa_fees: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct TokenPoolAcc {
    // The authority is the account that signs on behalf of the PoA application (typically via the API) and has withdraw authority over the token pool fee vault
    pub authority: Pubkey,
    // The unique token name for the token pool
    pub token_pool_name: String,
    pub mint_address: Pubkey,
    // The vault where the pool fees are collected for distribution
    pub pool_fee_vault: Pubkey,
    // The fixed amount of tokens to be rewarded for attention proofs
    pub reward_amount: u64,
    // The SOL fee to be collected by the pool for distributing rewards
    pub pool_fee: u64,
    // The timeout for the attention proof
    pub timeout_sec: u32,
}

impl TokenPoolAcc {
    pub fn size(token_pool_name: &String) -> usize {
        8 +  // discriminator
        32 + // authority (Pubkey)
        4 + token_pool_name.len() + // token_pool_name (String has 4-byte length prefix)
        32 + // mint_address (Pubkey)
        32 + // pool_fee_vault (Pubkey)
        8 +  // reward_amount (u64)
        8 +  // pool_fee (u64)
        4 // timeout_sec (u32)
    }

    pub fn validate(&self) -> Result<()> {
        require!(
            self.token_pool_name.len() <= MAX_NAME_LENGTH,
            CustomError::StringTooLong
        );
        Ok(())
    }
}

#[account]
pub struct FeeVault {
    pub token_pool_acc: Pubkey, // 32 bytes
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct TokenMetadataArgs {
    pub symbol: String,
    pub uri: String,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct TokenPoolInitArgs {
    pub pool_fee: u64,
    pub reward_amount: u64,
    pub timeout_sec: u32,
    pub token_decimals: u8,
    pub token_pool_name: Box<String>,
    pub total_supply: u64,
}

impl TokenPoolInitArgs {
    pub fn validate(&self) -> Result<()> {
        if self.token_pool_name.len() > MAX_NAME_LENGTH {
            return Err(CustomError::StringTooLong.into());
        }
        Ok(())
    }
}

pub fn token_pool_init(ctx: Context<TokenPoolInit>, args: TokenPoolInitArgs) -> Result<()> {
    ctx.accounts.token_pool_acc.validate()?;
    args.validate()?;

    // Set token pool account data directly without intermediate variables
    ctx.accounts.token_pool_acc.set_inner(TokenPoolAcc {
        authority: ctx.accounts.authority.key(),
        token_pool_name: *args.token_pool_name.clone(),
        mint_address: ctx.accounts.mint.key(),
        pool_fee_vault: ctx.accounts.fee_vault.key(),
        reward_amount: args.reward_amount,
        pool_fee: args.pool_fee,
        timeout_sec: args.timeout_sec,
    });

    // Process fee transfer
    invoke(
        &transfer(
            &ctx.accounts.authority.key(),
            &ctx.accounts.poa_fees.key(),
            BASE_FEE,
        ),
        &[
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.poa_fees.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Transfer tokens to the reward vault
    let ix = spl_token::instruction::transfer(
        &ctx.accounts.token_program.key(),
        &ctx.accounts.authority_token_account.key(),
        &ctx.accounts.token_pool_vault.key(),
        &ctx.accounts.authority.key(),
        &[],
        args.total_supply,
    )?;
    invoke(
        &ix,
        &[
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.authority_token_account.to_account_info(),
            ctx.accounts.token_pool_vault.to_account_info(),
            ctx.accounts.authority.to_account_info(),
        ],
    )?;

    Ok(())
}
