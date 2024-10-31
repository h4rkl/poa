import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import React, { useState, useEffect } from "react";
import { useAtomValue } from 'jotai';
import { balanceUpdateTriggerAtom } from '../dashboard/poa-ui';
import { ExplorerLink } from "../cluster/cluster-ui";
import Link from "next/link";

const RewardsPool: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const { connection } = useConnection();
  const publicKey = new PublicKey(process.env.NEXT_PUBLIC_REWARDS_POOL!);

  useEffect(() => {
    const fetchBalance = async () => {

      try {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };

    fetchBalance();
  }, [useAtomValue(balanceUpdateTriggerAtom)]);

  return (
    <div className="rounded-lg p-6 max-w-sm mx-auto border border-gray-600">
      <h2 className="text-2xl font-bold mb-4">Reward Pool</h2>
      <div className="flex items-center w-full justify-center">
        <span className="text-3xl font-bold">
          ☉{balance.toLocaleString()}
        </span>
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        For <Link className="text-sm link" href={`/poa#tokenomics`}>distribution</Link> to $CLICK pool winners
      </div>
      <div className="mt-4 flex justify-center">
        <a href={`https://twitter.com/intent/tweet?text=Proof of the $CLICK reward pool with ${balance.toLocaleString()} SOL - ${window.location.href}`}
           target="_blank"
           rel="noopener noreferrer"
           className="flex items-center text-sm text-gray-500 hover:text-gray-400">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          Share
        </a>
      </div>
    </div>
  );
};

export default RewardsPool;
