"use client";

import { Poa } from "../../poa/types";
import IDL from "../../poa/idl.json";
import { useConnection } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";

export function usePoaProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = new anchor.Program(IDL as Poa, provider);

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(program.programId),
  });

  const attentionInitialise = useMutation({
    mutationKey: ["poa", "attentionInitialise", { cluster }],
    mutationFn: (args: { tokenName: string }) =>
      program.methods.attentionInitialise(args).rpc(),
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
    }) => program.methods.tokenPoolInitialise(args).rpc(),
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
