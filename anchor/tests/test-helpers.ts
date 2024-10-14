import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const MINT_SEED = Buffer.from("memeoor_mint");
export const CONFIG_SEED = Buffer.from("memeoor_config");
export const TOKEN_VAULT_SEED = Buffer.from("memeoor_token_vault");
export const FEE_VAULT_SEED = Buffer.from("memeoor_fee_vault");

export function toLamports(amount: number): number {
  return amount * LAMPORTS_PER_SOL;
}