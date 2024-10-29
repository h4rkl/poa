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
    <>
      <button
        ref={buttonRef}
        className="btn btn-xl lg:btn-lg btn-primary min-w-xl"
        onClick={handleClick}
        disabled={attentionInteract.isPending}
      >
        Click{attentionInteract.isPending && "..."}
      </button>
    </>
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
