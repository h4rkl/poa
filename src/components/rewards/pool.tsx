import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import React, { useState, useEffect } from "react";

const RewardsPool: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const { connection } = useConnection();

  useEffect(() => {
    const fetchBalance = async () => {
      const publicKey = new PublicKey(process.env.NEXT_PUBLIC_REWARDS_POOL!);

      try {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div className="rounded-lg p-6 max-w-sm mx-auto border border-gray-600">
      <h2 className="text-2xl font-bold mb-4">Rewards Pool</h2>
      <div className="flex items-center w-full justify-center">
        <span className="text-3xl font-bold">
          ☉{balance.toLocaleString()}
        </span>
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        For distributing to $CLICK pool winners
      </div>
    </div>
  );
};

export default RewardsPool;
