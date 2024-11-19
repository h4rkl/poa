"use client";

import React from "react";
import { sendGAEvent } from '@next/third-parties/google'

interface AdvertisementProps {
  icon: string;
  title: string;
  description: string;
  url: string;
  bgColor: string;
  textColor: string;
  buttonColor: string;
}

export const Advertisement: React.FC<AdvertisementProps> = ({
  icon,
  title,
  description,
  bgColor,
  url,
  textColor,
  buttonColor,
}) => {
  const handleButtonClick = () => {
    sendGAEvent({ event: 'advertisement_click', value: title });
    window.open(url, "_blank");
  };
  return (
    <div className="flex items-center justify-center pt-6 md:pt-0 px-1 md:px-0">
      <div className="w-full max-w-xl md:px-4 pt-12">
        <div className="hidden md:block text-gray-500 text-xs text-left mb-2">
          Powered by
        </div>
        <div
          className={`flex flex-row ${bgColor} items-center justify-between md:pl-2 pr-2 py-2 rounded-lg shadow-md`}
        >
          <div className="flex flex-row items-center space-y-0 space-x-4">
            <div
              className={`hidden md:block rounded-full overflow-hidden ${textColor}`}
              style={{ width: "86px", height: "86px" }}
            >
              <img
                className="object-cover w-full h-full"
                src={`ads/${icon}`}
                alt={`${title} logo`}
              />
            </div>
            <div className="text-left">
              <h1 className={`text-2xl md:text-3xl font-bold ${textColor}`}>
                {title}
              </h1>
              <p className="hidden sm:block text-gray-500 text-base text-lg font-light mt-2">
                {description}
              </p>
            </div>
          </div>
          <button
            className={`${buttonColor} text-white px-4 py-2 rounded-lg mt-0 hover:bg-opacity-80 cursor-pointer`}
            onClick={handleButtonClick}
          >
            Find out more
          </button>
        </div>
      </div>
    </div>
  );
};
