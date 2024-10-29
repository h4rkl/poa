"use client";

import React, { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";

interface TokenHolder {
  address: string;
  balance: number;
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
        console.log("largestAccounts:", largestAccounts);

        const filteredAccounts = largestAccounts.value.filter(
          (account) => account.address.toBase58() !== tokenVaultAddress
        );

        const top3 = filteredAccounts.slice(0, 3).map((account) => ({
          address: account.address.toBase58(),
          balance: Number(account.amount) / Math.pow(10, 9), // Assuming 9 decimals, adjust if different
        }));

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
        Top 3 Token Holders
      </h2>
      <ul className="space-y-3">
        {topHolders.map((holder, index) => (
          <li
            key={holder.address}
            className="flex justify-between items-center border-b pb-2 border-gray-600"
          >
            <span className="font-medium">{index + 1}.</span>
            <span className="text-blue-500 hover:underline">
              <ExplorerLink
                label={ellipsify(holder.address)}
                path={`account/${holder.address}`}
              />
            </span>
            <span className="font-semibold">
              {(holder.balance * 10000).toFixed(0)} $CLICK
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaderFeature;
