use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        create_metadata_accounts_v3,
        mpl_token_metadata::types::DataV2,
        CreateMetadataAccountsV3,
    },
    token,
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeTokenPoolArgs {
    pub token_name: String,
    uri: String,
    symbol: String,
    pub token_decimals: u8,
    initial_cost: u64,
    step_interval: u64,
    step_factor: u64,
    total_supply: u64,
}

pub fn initialize_token(
    ctx: Context<InitializeTokenPool>,
    args: InitializeTokenPoolArgs,
) -> Result<()> {
    let token_pool_acc = &mut ctx.accounts.token_pool_acc;
    token_pool_acc.authority = ctx.accounts.authority.key();
    token_pool_acc.initial_cost = args.initial_cost;
    token_pool_acc.step_interval = args.step_interval;
    token_pool_acc.step_factor = args.step_factor;
    token_pool_acc.pool_fee_vault = ctx.accounts.fee_vault.key();

    // Mint the total supply to the token_pool authority
    let mint_signer_seeds: &[&[&[u8]]] =
        &[&[MINT_SEED, &args.token_name.as_ref(), &[ctx.bumps.mint]]];

    // On-chain token metadata for the mint
    let data_v2 = DataV2 {
        name: "Solana Gold".to_string(),
        symbol: "GOLDSOL".to_string(),
        uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json".to_string(),
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
        args.total_supply,
    )?;

    Ok(())
}
