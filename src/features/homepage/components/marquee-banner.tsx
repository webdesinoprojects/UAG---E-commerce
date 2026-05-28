"use client";

import React, { useEffect, useState } from "react";
import { Truck, Sparkles } from "lucide-react";

export default function MarqueeBanner() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const items = [
    { text: "FAST & FREE DELIVERY ON EVERY ORDER", type: "delivery" },
    { text: "GET 5% EXTRA DISCOUNT ON PREPAID ORDERS", type: "discount" },
  ];

  // Repeat items to fill screen width
  const repeatedItems = [...items, ...items, ...items, ...items, ...items, ...items];

  return (
    <div className="mt-[25px] w-full bg-zinc-950 text-white border-y border-zinc-850 py-3 overflow-hidden select-none font-heading relative">


      <div
        className={`marquee-container ${!isReducedMotion ? "marquee-animation" : ""}`}
        tabIndex={0}
        aria-label="Promotional Announcement Banner"
      >
        {repeatedItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 mx-6 text-xs sm:text-sm font-extrabold tracking-wider text-zinc-100 uppercase"
          >
            {item.type === "delivery" ? (
              <Truck className="h-4.5 w-4.5 text-amber-400 shrink-0" />
            ) : (
              <Sparkles className="h-4.5 w-4.5 text-amber-400 shrink-0" />
            )}
            <span>{item.text}</span>
            <span className="text-zinc-700 ml-4 font-normal">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
