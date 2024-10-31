"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ExplorerLink } from "../cluster/cluster-ui";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { usePoaProgram } from "./poa-data-access";
import { POACreate } from "./poa-ui";
import RewardsPool from "../rewards/pool";

export default function POAFeature() {
  const { publicKey } = useWallet();
  const { programId } = usePoaProgram();

  return publicKey ? (
    <div>
      <AppHero title="POA" subtitle={"Click for attention"}>
        <POACreate />
        {/* <p className="mt-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p> */}
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
