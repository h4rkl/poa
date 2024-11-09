import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import React, { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { balanceUpdateTriggerAtom } from "../dashboard/poa-ui";
import Link from "next/link";
import Tweet from "../ui/tweet";

const RewardsPool: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const { connection } = useConnection();
  const feeVault = new PublicKey(process.env.NEXT_PUBLIC_TOKEN_FEE_VAULT!);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await connection.getBalance(feeVault);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    };

    fetchBalance();
  }, [connection, useAtomValue(balanceUpdateTriggerAtom)]);

  return (
    <div className="rounded-lg p-6 max-w-sm mx-auto border border-gray-600">
      <h2 className="text-2xl font-bold mb-4">Reward Pool</h2>
      <div className="flex items-center w-full justify-center">
        <span className="text-3xl font-bold">☉{balance.toLocaleString()}</span>
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        For{" "}
        <Link className="text-sm link" href={`/poa#tokenomics`}>
          distribution
        </Link>{" "}
        to $CLICK pool winners
      </div>
      <div className="mt-4 flex justify-center">
        <Tweet
          text={`Proof of Attention $CLICK reward pool is currently at ${balance.toLocaleString()} SOL - ${
            window.location.href
          } 👀`}
        />
      </div>
    </div>
  );
};

export default RewardsPool;
