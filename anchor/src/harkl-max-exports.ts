// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import HarklMaxIDL from '../target/idl/memeoor.json';
import type { HarklMax } from '../target/types/memeoor';

// Re-export the generated IDL and type
export { HarklMax, HarklMaxIDL };

// The programId is imported from the program IDL.
export const MEMEOOR_PROGRAM_ID = new PublicKey(HarklMaxIDL.address);

// This is a helper function to get the HarklMax Anchor program.
export function getHarklMaxProgram(provider: AnchorProvider) {
  return new Program(HarklMaxIDL as HarklMax, provider);
}

// This is a helper function to get the program ID for the HarklMax program depending on the cluster.
export function getHarklMaxProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return MEMEOOR_PROGRAM_ID;
  }
}
