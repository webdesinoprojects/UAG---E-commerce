"use client";

import { Box, ChartLine, Star, Timer } from "lucide-react";
import Link from "next/link";

export default function Milestones() {
  return (
    <section className="w-full border-t border-zinc-100 bg-white pt-12 pb-0 font-sans dark:border-zinc-800/40 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-medium tracking-wide uppercase font-sans sm:text-2xl">
            <span className="text-zinc-950 text-3xl dark:text-white">UAG </span>
            <span className="text-orange-600 text-3xl dark:text-orange-500">– URBN ARMOUR GEAR</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex min-h-[180px] flex-col items-start justify-between rounded-2xl bg-zinc-100 p-6 text-left dark:bg-zinc-900 sm:min-h-[220px] sm:p-9">
            <Box className="h-8 w-8 stroke-[1.6] text-orange-600 sm:h-10 sm:w-10" />
            <div>
              <span className="block text-2xl font-black leading-none text-zinc-900 font-heading dark:text-white sm:text-4xl">20Mn+</span>
              <span className="mt-2 block text-[11px] font-extrabold tracking-wider text-zinc-900 uppercase dark:text-zinc-300 sm:text-xs">Units Sold</span>
            </div>
          </div>
          <div className="flex min-h-[180px] flex-col items-start justify-between rounded-2xl bg-zinc-100 p-6 text-left dark:bg-zinc-900 sm:min-h-[220px] sm:p-9">
            <Star className="h-7 w-7 fill-orange-600 text-orange-600 sm:h-9 sm:w-9" />
            <div>
              <span className="block text-2xl font-black leading-none text-zinc-900 font-heading dark:text-white sm:text-4xl">02Mn+</span>
              <span className="mt-2 block text-[11px] font-extrabold tracking-wider text-zinc-900 uppercase dark:text-zinc-300 sm:text-xs">Product Reviews</span>
            </div>
          </div>
          <div className="flex min-h-[110px] items-center gap-5 rounded-2xl bg-zinc-100 p-6 text-left dark:bg-zinc-900 sm:min-h-[130px] sm:p-8">
            <ChartLine className="h-8 w-8 shrink-0 stroke-[1.8] text-orange-600 sm:h-10 sm:w-10" />
            <div><span className="block text-base font-black leading-tight text-zinc-900 font-heading dark:text-white sm:text-xl">100% YOY</span><span className="mt-1 block text-[9px] font-extrabold tracking-wider text-zinc-500 uppercase sm:text-[11px]">400% QOQ Growth</span></div>
          </div>
          <div className="flex min-h-[110px] items-center gap-5 rounded-2xl bg-zinc-100 p-6 text-left dark:bg-zinc-900 sm:min-h-[130px] sm:p-8">
            <Timer className="h-8 w-8 shrink-0 stroke-[1.8] text-orange-600 sm:h-10 sm:w-10" />
            <div><span className="block text-base font-black leading-tight text-zinc-900 font-heading dark:text-white sm:text-xl">1 Unit Sold</span><span className="mt-1 block text-[9px] font-extrabold tracking-wider text-zinc-500 uppercase sm:text-[11px]">Every 05 Sec</span></div>
          </div>
        </div>

      </div>
    </section>
  );
}
