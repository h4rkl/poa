import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const MINT_SEED = Buffer.from("mint");
export const CONFIG_SEED = Buffer.from("config");
export const TOKEN_VAULT_SEED = Buffer.from("token_vault");
export const FEE_VAULT_SEED = Buffer.from("fee_vault");

export function toLamports(amount: number): number {
  return amount * LAMPORTS_PER_SOL;
}
