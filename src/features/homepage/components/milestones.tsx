"use client";

import React from "react";
import { Package, Star, TrendingUp, Timer } from "lucide-react";

export default function Milestones() {
  return (
    <section className="w-full bg-white py-12 dark:bg-zinc-900/10 font-sans border-t border-zinc-100 dark:border-zinc-800/40">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float-icon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes shoot-up { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(4px, -4px); } }
          @keyframes tick-tock { 0%, 100% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } }
        `}} />
        
        {/* Section Header */}
        <div className="flex justify-center items-center text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-black tracking-wide uppercase font-heading select-none">
            <span className="text-zinc-950 dark:text-white">UAG </span>
            <span className="text-zinc-400 font-normal">—</span>{" "}
            <span className="text-orange-600 dark:text-orange-500">URBN ARMOUR GEAR</span>
          </h2>
        </div>

        {/* 2x2 Responsive Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          
          {/* Top Left: 20Mn+ Units Sold */}
          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-4 md:p-8 flex flex-col items-center text-center md:items-start md:text-left justify-between min-h-[130px] md:min-h-[180px] transition-all hover:shadow-xs hover:border-zinc-200 dark:hover:border-zinc-700">
            <Package className="h-6 w-6 md:h-7 md:w-7 text-orange-600 dark:text-orange-500 stroke-[1.5]" style={{ animation: 'float-icon 3s ease-in-out infinite' }} />
            <div className="mt-3 md:mt-4">
              <span className="block text-2xl md:text-3xl font-black font-heading text-zinc-900 dark:text-white leading-none">
                20Mn+
              </span>
              <span className="block text-[9px] md:text-[10px] font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mt-1">
                Units Sold
              </span>
            </div>
          </div>

          {/* Top Right: 02Mn+ Reviews */}
          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-4 md:p-8 flex flex-col items-center text-center md:items-start md:text-left justify-between min-h-[130px] md:min-h-[180px] transition-all hover:shadow-xs hover:border-zinc-200 dark:hover:border-zinc-700">
            <Star className="h-5 w-5 md:h-6 md:w-6 fill-orange-600 text-orange-600 dark:fill-orange-500 dark:text-orange-500" style={{ animation: 'spin-slow 6s linear infinite' }} />
            <div className="mt-3 md:mt-4">
              <span className="block text-2xl md:text-3xl font-black font-heading text-zinc-900 dark:text-white leading-none">
                02Mn+
              </span>
              <span className="block text-[9px] md:text-[10px] font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mt-1">
                Product Reviews
              </span>
            </div>
          </div>

          {/* Bottom Left: 100% YOY */}
          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-3 md:p-5 flex flex-col md:flex-row items-center text-center md:text-left justify-center md:justify-start gap-2 md:gap-4 transition-all hover:shadow-xs hover:border-zinc-200 dark:hover:border-zinc-700">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-orange-600 dark:text-orange-500 stroke-[1.8] shrink-0" style={{ animation: 'shoot-up 2.5s ease-in-out infinite' }} />
            <div className="flex flex-col justify-center">
              <span className="text-sm md:text-base font-black font-heading text-zinc-900 dark:text-white leading-tight">
                100% YOY
              </span>
              <span className="text-[8px] md:text-[9px] font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                400% QOQ Growth
              </span>
            </div>
          </div>

          {/* Bottom Right: 1 Unit Sold Every 05 Sec */}
          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-3 md:p-5 flex flex-col md:flex-row items-center text-center md:text-left justify-center md:justify-start gap-2 md:gap-4 transition-all hover:shadow-xs hover:border-zinc-200 dark:hover:border-zinc-700">
            <Timer className="h-5 w-5 md:h-6 md:w-6 text-orange-600 dark:text-orange-500 stroke-[1.8] shrink-0" style={{ animation: 'tick-tock 2s ease-in-out infinite' }} />
            <div className="flex flex-col justify-center">
              <span className="text-sm md:text-base font-black font-heading text-zinc-900 dark:text-white leading-tight">
                1 Unit Sold
              </span>
              <span className="text-[8px] md:text-[9px] font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                Every 05 Sec
              </span>
            </div>
          </div>

        </div>

        {/* Footer Accent Text */}
        <div className="flex justify-center mt-6">
          <a
            href="/categories"
            className="text-[10px] font-extrabold tracking-widest text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 uppercase transition-colors"
          >
            Hurry up to buy
          </a>
        </div>

      </div>
    </section>
  );
}
