"use client";

import "./poa-ui.css";

import { useState, useEffect } from "react";
import { attentionTokenMetadata } from "@/poa/constants";
import { usePoaProgram } from "./poa-data-access";
import { useExplosiveButton } from "@/hooks/button-explode";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { isLiveAtom } from "../countdown";

export const balanceUpdateTriggerAtom = atom(0);

export function POACreate() {
  const { attentionInteract } = usePoaProgram();
  const { buttonRef, explode } = useExplosiveButton();
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const setBalanceUpdateTrigger = useSetAtom(balanceUpdateTriggerAtom);
  const isLive = useAtomValue(isLiveAtom);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownRemaining > 0) {
      timer = setTimeout(() => {
        setCooldownRemaining((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownRemaining]);

  const handleClick = async () => {
    if (!isLive) return;

    try {
      // First run the mutation
      await attentionInteract.mutateAsync({
        tokenPoolName: attentionTokenMetadata.name,
      });
      // Add a small delay to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 50));
      // Then trigger the explosion
      await explode();
      setCooldownRemaining(
        Number(process.env.NEXT_PUBLIC_COOLDOWN_SECONDS) || 0
      );
      setBalanceUpdateTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error during interaction:", error);
    }
  };

  const isDisabled = attentionInteract.isPending || cooldownRemaining > 0 || !isLive;

  return (
    <div className="flex w-full min-h-[200px] items-center justify-center">
      <div className="w-full max-w-xs px-4">
        <button
          ref={buttonRef}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-sans text-xl py-4 px-8 rounded-full transition-colors duration-150 ease-linear focus:outline-none active:transform active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleClick}
          disabled={isDisabled}
        >
          {!isLive
            ? "Campaign Ended"
            : isDisabled
              ? cooldownRemaining > 0
                ? `Recharging: ${cooldownRemaining}s`
                : "Igniting..."
              : "Go Boom"}
        </button>
      </div>
    </div>
  );
}
