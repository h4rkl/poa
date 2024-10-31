"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { fromTokenAmount } from "@/utils";
import { ExplorerLink } from "../cluster/cluster-ui";
import { ellipsify } from "../ui/ui-layout";
import Tweet from "../ui/tweet";

export const AccountPoa = () => {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mintAcc, setMintAcc] = useState<string>("");
  const [tokenVault, setTokenVault] = useState<string>("");
  const [tokenVaultBalance, setTokenVaultBalance] = useState<string>("");
  const { connection } = useConnection();

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        // Get mint address from env
        const mint = process.env.NEXT_PUBLIC_MINT!;
        const tokenVault = process.env.NEXT_PUBLIC_TOKEN_VAULT!;
        setTokenVault(tokenVault);
        const tokenVaultBalance = await getAccount(
          connection,
          new PublicKey(tokenVault)
        );
        setTokenVaultBalance(fromTokenAmount(Number(tokenVaultBalance.amount)));
        if (publicKey && mint) {
          // Get the associated token account address
          const mintPubkey = new PublicKey(mint);
          const tokenAddress = await getAssociatedTokenAddress(
            mintPubkey,
            publicKey
          );
          setMintAcc(tokenAddress.toString());
          // Get token account info
          const tokenAccount = await getAccount(connection, tokenAddress);
          setBalance(Number(tokenAccount.amount) || 0);
        }
      } catch (error) {
        console.error("Error fetching account info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, [publicKey, connection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="rounded-lg shadow-md p-6 max-w-md mx-auto">
        <p className="text-center text-gray-600">Please connect your wallet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-6 mt-2 max-w-sm mx-auto border border-gray-600">
      <h2 className="text-2xl font-bold mb-4 text-center">You have</h2>
      <div className="flex items-center gap-2 justify-center">
        <p className="font-mono text-sm break-all">
          <ExplorerLink
            label={ellipsify(mintAcc)}
            path={`account/${mintAcc}`}
          />
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center w-full justify-center">
          <span className="text-3xl font-bold">
            {fromTokenAmount(balance)} $CLICK
          </span>
        </div>
        <div className="flex items-center gap-2 justify-center mt-4">
          <p className="font-mono text-sm break-all">{tokenVaultBalance}</p>
          <p className="text-sm text-gray-500">remaining in</p>
          <p className="font-mono text-sm break-all">
            <ExplorerLink
              label={ellipsify(tokenVault)}
              path={`account/${tokenVault}`}
            />
          </p>
        </div>
        <div className="mt-4 flex justify-center">
          <Tweet
            text={`🚀 Stacked ${fromTokenAmount(
              balance
            )} $CLICK so far by Exploding the Button at ${
              window.location.href
            }`}
          />
        </div>
      </div>
    </div>
  );
};
