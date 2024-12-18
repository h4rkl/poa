"use client";

import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { fromTokenAmount } from "@/utils";
import { useAtomValue } from "jotai";
import { balanceUpdateTriggerAtom } from "../dashboard/poa-ui";

const MAX_TOP_HOLDERS = 10;

interface TokenHolder {
  address: string;
  balance: number;
  isUser?: boolean;
}

const LeaderFeature: React.FC = () => {
  const [topHolders, setTopHolders] = useState<TokenHolder[]>([]);
  const [loading, setLoading] = useState(true);

  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const updateTrigger = useAtomValue(balanceUpdateTriggerAtom);

  useEffect(() => {
    const fetchTopHolders = async () => {
      try {
        const tokenAddress = process.env.NEXT_PUBLIC_MINT!;
        const tokenPublicKey = new PublicKey(tokenAddress);
        const tokenVaultAddress = process.env.NEXT_PUBLIC_TOKEN_POOL_VAULT!;
        const meteoraPool = "BjvW8XtaDme6RWSrCQvcBmxbN1KkgKSTJsGZRwRJd9fv";

        const largestAccounts = await connection.getTokenLargestAccounts(
          tokenPublicKey
        );

        const excludedAddresses = new Set([tokenVaultAddress, meteoraPool]);
        const filteredAccounts = largestAccounts.value.filter(
          (account) => !excludedAddresses.has(account.address.toBase58())
        );

        let topDogs: TokenHolder[] = filteredAccounts
          .slice(0, MAX_TOP_HOLDERS)
          .map((account) => ({
            address: account.address.toBase58(),
            balance: Number(account.amount) / Math.pow(10, 5),
            isUser: false,
          }));

        // Fetch user's token balance if wallet is connected
        if (publicKey) {
          const userTokenAccount = await connection.getTokenAccountsByOwner(
            publicKey,
            { mint: tokenPublicKey }
          );
          if (userTokenAccount.value.length > 0) {
            const userTokenAccountAddress =
              userTokenAccount.value[0].pubkey.toBase58();
            const userBalance = await connection.getTokenAccountBalance(
              userTokenAccount.value[0].pubkey
            );
            const userTokenBalance = Number(
              fromTokenAmount(Number(userBalance.value.amount))
            );

            if (userTokenBalance > 0) {
              const userHolder: TokenHolder = {
                address: userTokenAccountAddress,
                balance: userTokenBalance,
                isUser: true,
              };

              // Add user to the list if they're not already
              if (
                !topDogs.some(
                  (holder) => holder.address === userTokenAccountAddress
                )
              ) {
                topDogs.push(userHolder);
                topDogs.sort((a, b) => b.balance - a.balance);
                topDogs = topDogs.slice(0, MAX_TOP_HOLDERS + 1);
              } else {
                topDogs.find(
                  (holder) => holder.address === userTokenAccountAddress
                )!.isUser = true;
              }
            }
          }
        }

        setTopHolders(topDogs);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top holders:", error);
        setLoading(false);
      }
    };

    fetchTopHolders();
  }, [publicKey, connection, updateTrigger]);

  if (loading) {
    return <div className="text-center text-lg">Loading...</div>;
  }

  return (
    <>
      <div className="leaderboard max-w-2xl mt-6 px-4 mx-auto py-6 shadow-md rounded-lg border border-gray-600 bg-black/20 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-center mb-4">Leaderboard</h2>
        <ul className="max-h-[20em] overflow-y-auto">
          {topHolders.map((holder, index) => (
            <li
              key={holder.address}
              className={`flex justify-between items-center border-b px-2 py-4 border-gray-600 ${
                holder.isUser ? "bg-purple-100 dark:bg-purple-900" : ""
              }`}
            >
              <span className="font-medium">
                {holder.isUser &&
                index === topHolders.length - 1 &&
                topHolders.length > MAX_TOP_HOLDERS
                  ? "😊"
                  : `${index + 1}.`}
              </span>
              <span className="text-pink-500 hover:underline">
                <ExplorerLink
                  label={ellipsify(holder.address)}
                  path={`account/${holder.address}`}
                />
                {holder.isUser && " (You)"}
              </span>
              <span className="font-semibold">{holder.balance} $CLICK</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="h-6"></div>
    </>
  );
};

export default LeaderFeature;
