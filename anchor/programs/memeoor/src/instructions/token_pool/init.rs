use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        create_metadata_accounts_v3,
        mpl_token_metadata::types::DataV2,
        CreateMetadataAccountsV3,
    },
    token,
};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeTokenPoolArgs {
    initial_cost: u64,
    step_factor: u64,
    step_interval: u64,
    symbol: String,
    pub token_decimals: u8,
    pub token_name: String,
    total_supply: u64,
    uri: String,
}

pub fn initialize_token(
    ctx: Context<InitializeTokenPool>,
    args: InitializeTokenPoolArgs,
) -> Result<()> {
    let InitializeTokenPoolArgs {
        initial_cost,
        step_factor,
        step_interval,
        symbol,
        token_decimals: _, 
        token_name,
        total_supply,
        uri,
    } = args;

    let token_pool_acc = &mut ctx.accounts.token_pool_acc;

    // Creating token pool account
    token_pool_acc.set_inner(TokenPoolAcc {
        authority: ctx.accounts.authority.key(),
        mint_address: ctx.accounts.mint.key(),
        pool_fee_vault: ctx.accounts.fee_vault.key(),
        initial_cost,
        step_interval,
        step_factor,
    });

    // Mint the total supply to the token_pool authority
    let mint_signer_seeds: &[&[&[u8]]] = &[&[MINT_SEED, &token_name.as_ref(), &[ctx.bumps.mint]]];

    // fn truncate_symbol(symbol: &str) -> String {
    //     symbol.chars().take(200).collect::<String>()
    // }
    // msg!("*****************symbol: {}", truncate_symbol(&symbol));
    // msg!("*****************uri: {}", truncate_symbol(&uri));
    // msg!("*****************name: {}", truncate_symbol(&token_name));

    // On-chain token metadata for the mint
    let data_v2 = DataV2 {
        name: token_name.clone(),
        symbol,
        uri,
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    // CPI Context
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            mint_authority: ctx.accounts.mint.to_account_info(),
            payer: ctx.accounts.authority.to_account_info(),
            update_authority: ctx.accounts.mint.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        },
        mint_signer_seeds,
    );

    create_metadata_accounts_v3(cpi_ctx, data_v2, true, true, None)?;

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_pool_vault.to_account_info(),
                authority: ctx.accounts.mint.to_account_info(),
            },
            mint_signer_seeds,
        ),
        total_supply,
    )?;

    Ok(())
}
