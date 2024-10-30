"use client";

import { useState, useEffect } from "react";
import { attentionTokenMetadata } from "@/poa/constants";
import { usePoaProgram } from "./poa-data-access";
import { useExplosiveButton } from "@/hooks/button-explode";

import "./poa-ui.css";

export function POACreate() {
  const { attentionInteract } = usePoaProgram();
  const { buttonRef, explode } = useExplosiveButton();
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownRemaining > 0) {
      timer = setTimeout(() => {
        setCooldownRemaining(prevTime => prevTime - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownRemaining]);

  const handleClick = async () => {
    // await attentionInteract.mutateAsync({
    //   tokenName: attentionTokenMetadata.name,
    // });
    explode();
    setTimeout(() => {
      setCooldownRemaining(Number(process.env.NEXT_PUBLIC_COOLDOWN_SECONDS) || 0);
    }, 1000);
  };

  const isDisabled = attentionInteract.isPending || cooldownRemaining > 0;

  return (
    <div className="flex w-full min-h-[200px] items-center justify-center">
      <div className="w-full max-w-4xl px-4">
        <button
          ref={buttonRef}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-sans text-base py-2 px-4 rounded-sm transition-colors duration-150 ease-linear focus:outline-none active:transform active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleClick}
          disabled={isDisabled}
        >
          {isDisabled
            ? cooldownRemaining > 0
              ? `Cooldown: ${cooldownRemaining}s`
              : "Clicking..."
            : "Click"}
        </button>
      </div>
    </div>
  );
}
