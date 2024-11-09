"use client";

import { atom, useAtomValue } from "jotai";
import { createContext, ReactNode, useContext } from "react";

export enum ClusterNetwork {
  Mainnet = "mainnet-beta",
  Testnet = "testnet",
  Devnet = "devnet",
  Custom = "custom",
}
export interface Cluster {
  endpoint: string;
  name: string;
}

const clusterAtom = atom<Cluster>({
  name: process.env.NEXT_PUBLIC_SOLANA_RPC_NAME!,
  endpoint: process.env.NEXT_PUBLIC_SOLANA_RPC!,
});

export interface ClusterProviderContext {
  cluster: Cluster;
  getExplorerUrl(path: string): string;
}

const Context = createContext<ClusterProviderContext>(
  {} as ClusterProviderContext
);

export function ClusterProvider({ children }: { children: ReactNode }) {
  const cluster = useAtomValue(clusterAtom);

  const value: ClusterProviderContext = {
    cluster,
    getExplorerUrl: (path: string) =>
      `https://explorer.solana.com/${path}${getClusterUrlParam(cluster)}`,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCluster() {
  return useContext(Context);
}

function getClusterUrlParam(cluster: Cluster): string {
  let suffix = "";
  switch (cluster.name) {
    case ClusterNetwork.Devnet:
      suffix = "devnet";
      break;
    case ClusterNetwork.Testnet:
      suffix = "testnet";
      break;
    case ClusterNetwork.Mainnet:
      suffix = "mainnet-beta";
      break;
    default:
      suffix = `custom&customUrl=${encodeURIComponent(cluster.endpoint)}`;
      break;
  }

  return suffix.length ? `?cluster=${suffix}` : "";
}
