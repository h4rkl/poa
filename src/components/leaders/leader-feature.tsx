"use client";

import React, { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';

interface TokenHolder {
  address: string;
  balance: number;
}

const LeaderFeature: React.FC = () => {
  const [topHolders, setTopHolders] = useState<TokenHolder[]>([]);
  const [loading, setLoading] = useState(true);

  const { connection } = useConnection();

  useEffect(() => {
    const fetchTopHolders = async () => {
      try {

        // The token address (mint) you want to check
        const tokenAddress = process.env.NEXT_PUBLIC_MINT!;
        const tokenPublicKey = new PublicKey(tokenAddress);

        // Fetch largest token accounts
        const largestAccounts = await connection.getTokenLargestAccounts(tokenPublicKey);
        console.log('largestAccounts:', largestAccounts);

        // Get top 3 holders
        const top3 = largestAccounts.value.slice(0, 3).map(account => ({
          address: account.address.toBase58(),
          balance: Number(account.amount) / Math.pow(10, 9) // Assuming 9 decimals, adjust if different
        }));

        setTopHolders(top3);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching top holders:', error);
        setLoading(false);
      }
    };

    fetchTopHolders();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="leaderboard">
      <h2>Top 3 Token Holders</h2>
      <ul>
        {topHolders.map((holder, index) => (
          <li key={holder.address}>
            <span>{index + 1}. </span>
            <span>{<ExplorerLink label={ellipsify(holder.address)} path={`account/${holder.address}`} />}</span>
            <span> - {(holder.balance*10000).toFixed(0)} tokens</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaderFeature;