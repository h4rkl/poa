"use client";

import { useEffect, useState } from 'react';
import { atom, useAtom } from 'jotai';

export const endDate = new Date('2024-12-12T00:00:00Z');
export const isLiveAtom = atom<boolean>(new Date() < endDate);
const endDateAtom = atom<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

export const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [endDate] = useAtom(endDateAtom);
  const [, setIsLive] = useAtom(isLiveAtom);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance <= 0) {
        clearInterval(timer);
        setIsLive(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, setIsLive]);

  return (
    <div className="flex w-full min-h-[200px] items-center justify-center">
      <div className="w-full max-w-2xl px-4 flex gap-4 justify-center">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center">
            <div className="bg-pink-600 text-white font-sans text-3xl py-4 px-6 rounded-lg w-24 text-center">
              {value}
            </div>
            <span className="text-gray-600 mt-2 font-sans capitalize">
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};