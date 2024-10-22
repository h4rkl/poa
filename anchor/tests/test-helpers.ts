import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export const MINT_SEED = Buffer.from("mint");
export const CONFIG_SEED = Buffer.from("config");
export const TOKEN_VAULT_SEED = Buffer.from("token_vault");
export const FEE_VAULT_SEED = Buffer.from("fee_vault");
export const PROOF_ACC_SEED = Buffer.from("proof_acc");

export const attentionAccount = new PublicKey("attn9Nw2iXDoW2guYwdtmh4xagadhhXqYcnbHTyfK5r");

export const attentionTokenMetadata = {
  uri: "https://raw.githubusercontent.com/zetamarkets/brand/master/token/zex.json",
  name: "Attention",
  symbol: "CLICK",
};

export function toLamports(amount: number): number {
  return amount * LAMPORTS_PER_SOL;
}
