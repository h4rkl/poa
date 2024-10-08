// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import MemeoorIDL from '../target/idl/memeoor.json';
import type { Memeoor } from '../target/types/memeoor';

// Re-export the generated IDL and type
export { Memeoor, MemeoorIDL };

// The programId is imported from the program IDL.
export const MEMEOOR_PROGRAM_ID = new PublicKey(MemeoorIDL.address);

// This is a helper function to get the Memeoor Anchor program.
export function getMemeoorProgram(provider: AnchorProvider) {
  return new Program(MemeoorIDL as Memeoor, provider);
}

// This is a helper function to get the program ID for the Memeoor program depending on the cluster.
export function getMemeoorProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return MEMEOOR_PROGRAM_ID;
  }
}
