// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import poaIDL from '../target/idl/poa.json';
import type { Poa } from '../target/types/poa';

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
