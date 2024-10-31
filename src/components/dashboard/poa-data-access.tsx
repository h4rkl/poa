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
  Transaction,
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
  const { signTransaction, publicKey: userAccount } = useWallet();
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
  const [tokenPoolVault] = PublicKey.findProgramAddressSync(
    [TOKEN_VAULT_SEED, mint.toBuffer(), tokenPoolAcc.toBuffer()],
    program.programId
  );
  const [feeVault] = PublicKey.findProgramAddressSync(
    [FEE_VAULT_SEED, tokenPoolAcc.toBuffer()],
    program.programId
  );
  const rewardVaultQuery = useQuery({
    queryKey: ["reward-vault", mint.toBase58(), userAccount?.toBase58()],
    queryFn: () => getAssociatedTokenAddress(mint, userAccount!),
    enabled: !!userAccount,
  });

  const proofAccount = userAccount
    ? PublicKey.findProgramAddressSync(
        [PROOF_ACC_SEED, userAccount.toBuffer(), mint.toBuffer()],
        program.programId
      )[0]
    : null;
  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(program.programId),
  });

  const attentionInteract = useMutation({
    mutationKey: ["poa", "attentionInteract", { cluster }],
    mutationFn: async (args: { tokenName: string }) => {
      if (
        !rewardVaultQuery.data ||
        !proofAccount ||
        !userAccount ||
        !signTransaction
      ) {
        throw new Error("Required data not available");
      }

      const tx = new Transaction();
      tx.add(
        await program.methods
          .attentionInteract({
            tokenName: args.tokenName,
          })
          .accountsStrict({
            tokenPoolAuthority: process.env.NEXT_PUBLIC_SIGNING_AUTHORITY!,
            attentionAuthority: userAccount,
            proofAccount,
            tokenMint: mint,
            tokenPoolAcc,
            tokenPoolVault,
            feeVault,
            rewardVault: rewardVaultQuery.data,
            poaFees,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
          .instruction()
      );

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = userAccount;

      // Partially sign the transaction
      const partiallySignedTx = await signTransaction(tx);

      // Serialize the partially signed transaction
      const serializedTx = partiallySignedTx.serialize({
        requireAllSignatures: false,
      }).toString("base64");

      const response = await fetch("/api/attention-interact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transaction: serializedTx }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to finalize transaction");
      }

      const { signature } = await response.json();
      return signature;
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to prove attention"),
  });

  const tokenPoolInitialise = useMutation({
    mutationKey: ["poa", "tokenPoolInitialise", { cluster }],
    mutationFn: (args: {
      authority: PublicKey;
      custodian: PublicKey;
      feeVault: PublicKey;
      metadataAccount: PublicKey;
      mint: PublicKey;
      poaFees: PublicKey;
      poolFee: anchor.BN;
      poolOwner: Keypair;
      rewardAmount: anchor.BN;
      symbol: string;
      timeoutSec: number;
      tokenDecimals: number;
      tokenName: string;
      tokenPoolAcc: PublicKey;
      tokenPoolVault: PublicKey;
      totalSupply: anchor.BN;
      uri: string;
    }) =>
      program.methods
        .tokenPoolInitialise(args)
        .accountsStrict({
          authority: args.authority,
          feeVault: args.feeVault,
          metadataAccount: args.metadataAccount,
          mint: args.mint,
          poaFees: args.poaFees,
          tokenPoolAcc: args.tokenPoolAcc,
          tokenPoolVault: args.tokenPoolVault,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
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
    attentionInteract,
    tokenPoolInitialise,
  };
}