// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import poaIDL from '../target/idl/poa.json';
import type { Poa } from '../target/types/poa';
// import poaIDL from './idl.json';
// import type { Poa } from './types';

// Re-export the generated IDL and type
export { Poa, poaIDL };

// The programId is imported from the program IDL.
export const POA_PROGRAM_ID = new PublicKey(poaIDL.address);

// This is a helper function to get the poa Anchor program.
export function getpoaProgram(provider: AnchorProvider) {
  return new Program(poaIDL as Poa, provider);
}

// This is a helper function to get the program ID for the poa program depending on the cluster.
export function getpoaProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return POA_PROGRAM_ID;
  }
}

export const MINT_SEED = Buffer.from("mint");
export const CONFIG_SEED = Buffer.from("config");
export const TOKEN_VAULT_SEED = Buffer.from("token_vault");
export const FEE_VAULT_SEED = Buffer.from("fee_vault");
export const PROOF_ACC_SEED = Buffer.from("proof_acc");

export const poaFees = new PublicKey("CLiCKaKS3DZUCr9WazTnXSM1Tky7kgrKy6tDQ2tSeZ9P");

export const attentionTokenMetadata = {
  uri: "https://gist.githubusercontent.com/h4rkl/c7e582319fe6c39570f12c1d77eba31f/raw/ba2c15ac7210838e51e0ba0faedea5ef6ee7d62a/data.json",
  name: "Click",
  symbol: "CLICK",
};

export function toLamports(amount: number): number {
  return amount * LAMPORTS_PER_SOL;
}

export function toTokenAmount(amount: number, decimals: number): number {
  return amount * 10 ** decimals;
}

