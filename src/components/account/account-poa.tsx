"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { fromTokenAmount } from "@/utils";
import { ExplorerLink } from "../cluster/cluster-ui";
import { ellipsify } from "../ui/ui-layout";
import Tweet from "../ui/tweet";
import { useAtomValue } from "jotai";
import { balanceUpdateTriggerAtom } from "../dashboard/poa-ui";

export const AccountPoa = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mintAcc, setMintAcc] = useState<string>("");
  const [tokenVault, setTokenVault] = useState<string>("");
  const [tokenVaultBalance, setTokenVaultBalance] = useState<string>("");

  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const balanceUpdateTrigger = useAtomValue(balanceUpdateTriggerAtom);

  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      setMintAcc("");
      return;
    }
    const fetchAccountInfo = async () => {
      try {
        // Get mint address from env
        const mint = process.env.NEXT_PUBLIC_MINT!;
        const tokenVault = process.env.NEXT_PUBLIC_TOKEN_POOL_VAULT!;
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
          // Get token account info
          const tokenAccount = await getAccount(connection, tokenAddress);
          tokenAccount.isInitialized;
          if (tokenAccount.isInitialized) {
            setMintAcc(tokenAddress.toString());
            setBalance(Number(tokenAccount.amount) || 0);
          } else {
            setBalance(0);
            setMintAcc("");
          }
        }
      } catch (error) {
        console.error("Error fetching account info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, [publicKey, connected, connection, balanceUpdateTrigger]);

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
        <p className="text-center text-gray-400">Please connect your wallet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-6 mt-2 max-w-sm mx-auto border border-gray-600 bg-black/20 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-2 text-center">You have</h2>
      <div className="flex items-center gap-2 justify-center">
        <p className="text-gray-500 text-sm break-all">
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
          <p className="text-sm break-all">{tokenVaultBalance} $CLICK</p>
          <p className="text-sm text-gray-500">left in</p>
          <p className="text-sm break-all">
            <ExplorerLink
              label={ellipsify(tokenVault)}
              path={`account/${tokenVault}`}
            />
          </p>
        </div>
        <div className="mt-4 flex justify-center">
          <Tweet
            text={`Stacked ${fromTokenAmount(
              balance
            )} $CLICK so far by Exploding the Button at ${
              window.location.href
            } 🚀🚀🚀 #OPOS #PoA`}
          />
        </div>
      </div>
    </div>
  );
};
