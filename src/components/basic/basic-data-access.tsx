"use client";

import { Poa } from "../../poa/types";
import IDL from "../../poa/idl.json";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import * as anchor from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  attentionTokenMetadata,
  CONFIG_SEED,
  FEE_VAULT_SEED,
  MINT_SEED,
  poaFees,
  PROOF_ACC_SEED,
  TOKEN_VAULT_SEED,
} from "@/poa/constants";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export function usePoaProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const { publicKey: userAccount } = useWallet();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = new anchor.Program(IDL as Poa, provider);

  const [mint] = PublicKey.findProgramAddressSync(
    [MINT_SEED, Buffer.from(attentionTokenMetadata.name)],
    program.programId
  );
  const [tokenPoolAcc] = PublicKey.findProgramAddressSync(
    [CONFIG_SEED, mint.toBuffer()],
    program.programId
  );
  // const [tokenPoolVault] = PublicKey.findProgramAddressSync(
  //   [TOKEN_VAULT_SEED, mint.toBuffer(), tokenPoolAcc.toBuffer()],
  //   program.programId
  // );
  // const [feeVault] = PublicKey.findProgramAddressSync(
  //   [FEE_VAULT_SEED, tokenPoolAcc.toBuffer()],
  //   program.programId
  // );
  const rewardVaultQuery = useQuery({
    queryKey: ["reward-vault", mint.toBase58(), userAccount?.toBase58()],
    queryFn: () => getAssociatedTokenAddress(mint, userAccount!),
    enabled: !!userAccount,
  });

  const [proofAccount] = PublicKey.findProgramAddressSync(
    [PROOF_ACC_SEED, userAccount!.toBuffer(), mint.toBuffer()],
    program.programId
  );
  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(program.programId),
  });

  const attentionInitialise = useMutation({
    mutationKey: ["poa", "attentionInitialise", { cluster }],
    mutationFn: (args: { tokenName: string }) => {
      if (!rewardVaultQuery.data) {
        throw new Error("Reward vault not loaded");
      }
      return program.methods
        .attentionInitialise(args)
        .accountsStrict({
          authority: userAccount!,
          tokenMint: mint,
          rewardVault: rewardVaultQuery.data,
          proofAccount,
          poaFees,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to initialize attention"),
  });

  const attentionProve = useMutation({
    mutationKey: ["poa", "attentionProve", { cluster }],
    mutationFn: () => program.methods.attentionProve().rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to prove attention"),
  });

  const tokenPoolInitialise = useMutation({
    mutationKey: ["poa", "tokenPoolInitialise", { cluster }],
    mutationFn: (args: {
      rewardAmount: anchor.BN;
      poolFee: anchor.BN;
      timeoutSec: number;
      symbol: string;
      tokenDecimals: number;
      tokenName: string;
      totalSupply: anchor.BN;
      uri: string;
      authority: PublicKey;
      mint: PublicKey;
      metadataAccount: PublicKey;
      tokenPoolAcc: PublicKey;
      tokenPoolVault: PublicKey;
      feeVault: PublicKey;
      poaFees: PublicKey;
      poolOwner: Keypair;
    }) =>
      program.methods
        .tokenPoolInitialise(args)
        .accountsStrict({
          authority: args.authority,
          mint: args.mint,
          metadataAccount: args.metadataAccount,
          tokenPoolAcc: args.tokenPoolAcc,
          tokenPoolVault: args.tokenPoolVault,
          feeVault: args.feeVault,
          poaFees: args.poaFees,
          tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to initialize token pool"),
  });

  return {
    program,
    programId: program.programId,
    getProgramAccount,
    attentionInitialise,
    attentionProve,
    tokenPoolInitialise,
  };
}
