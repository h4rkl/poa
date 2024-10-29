"use client";

import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { fromTokenAmount } from "@/utils";

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

  useEffect(() => {
    const fetchTopHolders = async () => {
      try {
        const tokenAddress = process.env.NEXT_PUBLIC_MINT!;
        const tokenPublicKey = new PublicKey(tokenAddress);
        const tokenVaultAddress = process.env.NEXT_PUBLIC_TOKEN_VAULT!;

        const largestAccounts = await connection.getTokenLargestAccounts(
          tokenPublicKey
        );

        const filteredAccounts = largestAccounts.value.filter(
          (account) => account.address.toBase58() !== tokenVaultAddress
        );

        let top3: TokenHolder[] = filteredAccounts.slice(0, 3).map((account) => ({
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
            const userTokenAccountAddress = userTokenAccount.value[0].pubkey.toBase58();
            const userBalance = await connection.getTokenAccountBalance(
              userTokenAccount.value[0].pubkey
            );
            const userTokenBalance = Number(
              fromTokenAmount(Number(userBalance.value.amount))
            );
            console.log("userTokenBalance:", userTokenBalance);

            if (userTokenBalance > 0) {
              const userHolder: TokenHolder = {
                address: userTokenAccountAddress,
                balance: userTokenBalance,
                isUser: true,
              };

              // Add user to the list if they're not in top 3
              if (!top3.some(holder => holder.address === userTokenAccountAddress)) {                
                top3.push(userHolder);
                top3.sort((a, b) => b.balance - a.balance);
                top3 = top3.slice(0, 4);
              }
              if (top3.some(holder => holder.address === userTokenAccountAddress)) {
                top3.find(holder => holder.address === userTokenAccountAddress)!.isUser = true;
              }
            }
          }
        }

        setTopHolders(top3);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top holders:", error);
        setLoading(false);
      }
    };

    fetchTopHolders();
  }, []);

  if (loading) {
    return <div className="text-center text-lg">Loading...</div>;
  }

  return (
    <div className="leaderboard max-w-2xl mt-6 px-4 mx-auto py-6 shadow-md rounded-lg border border-gray-600">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Leaderboard
      </h2>
      <ul>
        {topHolders.map((holder, index) => (
          <li
            key={holder.address}
            className={`flex justify-between items-center border-b px-2 py-4 border-gray-600 ${
              holder.isUser ? "bg-green-100 dark:bg-green-900" : ""
            }`}
          >
            <span className="font-medium">{index + 1}.</span>
            <span className="text-green-500 hover:underline">
              <ExplorerLink
                label={ellipsify(holder.address)}
                path={`account/${holder.address}`}
              />
              {holder.isUser && " (You)"}
            </span>
            <span className="font-semibold">
              {holder.balance} $CLICK
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaderFeature;
