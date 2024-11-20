"use client";

import React, { useState, useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { ads } from "./ads";
import { useAtomValue } from "jotai";
import { balanceUpdateTriggerAtom } from "@/components/dashboard/poa-ui";

interface AdvertisementProps {
  icon: string;
  title: string;
  description: string;
  url: string;
  bgColor: string;
  textColor: string;
  buttonColor: string;
}

export const Advertisement: React.FC = () => {
  const [adverts, setAdverts] = useState<AdvertisementProps[]>([]);
  const updateTrigger = useAtomValue(balanceUpdateTriggerAtom);

  useEffect(() => {
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    setAdverts([randomAd]);
    sendGAEvent("event", "advertisement_impression", { value: randomAd.title });
  }, [updateTrigger]);

  return (
    <div className="flex items-center justify-center pt-6 md:pt-0 px-1 md:px-0">
      {adverts.map((ad, index) => (
        <div key={index} className="w-full max-w-xl md:px-4 pt-12">
          <div className="hidden md:block text-gray-500 text-xs text-left mb-2">
            Powered by
          </div>
          <div
            className={`flex flex-row ${ad.bgColor} items-center justify-between md:pl-2 pr-2 py-2 rounded-lg shadow-md`}
          >
            <div className="flex flex-row items-center space-y-0 space-x-4">
              <div
                className={`hidden md:block rounded-full overflow-hidden ${ad.textColor}`}
                style={{ width: "86px", height: "86px" }}
              >
                <img
                  className="object-cover w-full h-full"
                  src={`ads/${ad.icon}`}
                  alt={`${ad.title} logo`}
                />
              </div>
              <div className="text-left">
                <h1 className={`text-2xl md:text-3xl font-bold ${ad.textColor}`}>
                  {ad.title}
                </h1>
                <p className="hidden sm:block text-gray-500 text-base text-lg font-light mt-2">
                  {ad.description}
                </p>
              </div>
            </div>
            <button
              className={`${ad.buttonColor} text-white px-4 py-2 rounded-lg mt-0 hover:bg-opacity-80 cursor-pointer`}
              onClick={() => {
                sendGAEvent("event", "advertisement_click", { value: ad.title });
                window.open(ad.url, "_blank");
              }}
            >
              Find out more
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
