"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero } from "../ui/ui-layout";
import { usePoaProgram } from "./poa-data-access";
import { POACreate } from "./poa-ui";
import RewardsPool from "../rewards/pool";

export default function POAFeature() {
  const { publicKey } = useWallet();
  const { programId } = usePoaProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Push the Button"
        subtitle={
          "An Unbottable Exploding Button Game Built On-Chain With Solana"
        }
      >
        <POACreate />
        <RewardsPool />
      </AppHero>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  );
}
