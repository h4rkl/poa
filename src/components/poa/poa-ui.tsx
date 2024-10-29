"use client";

import { attentionTokenMetadata } from "@/poa/constants";
import { usePoaProgram } from "./poa-data-access";
import { useExplosiveButton } from "@/hooks/button-explode";

import "./poa-ui.css";

export function POACreate() {
  const { attentionInteract } = usePoaProgram();
  const { buttonRef, explode } = useExplosiveButton();

  const handleClick = async () => {
    await attentionInteract.mutateAsync({
      tokenName: attentionTokenMetadata.name,
    });
    explode();
  };

  return (
    <div className="flex w-full min-h-[200px] items-center justify-center">
      <div className="w-full max-w-4xl px-4">
        <button
          ref={buttonRef}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-sans text-base py-2 px-4 rounded-sm transition-colors duration-150 ease-linear focus:outline-none active:transform active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleClick}
          disabled={attentionInteract.isPending}
        >
          Click{attentionInteract.isPending && "..."}
        </button>
      </div>
    </div>
  );
}

export function POAProgram() {
  const { getProgramAccount } = usePoaProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      <pre>{JSON.stringify(getProgramAccount.data.value, null, 2)}</pre>
    </div>
  );
}
