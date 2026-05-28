"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const detailedCategories = [
  {
    name: "Earbuds Or Airdopes ENC",
    count: 39,
    slug: "earbuds",
    image: "/images/categories/earbuds.png",
  },
  {
    name: "Neckband with Magnetic Sensor or ENC",
    count: 25,
    slug: "neckbands",
    image: "/images/categories/neckbands.png",
  },
  {
    name: "Portable & Party Speaker with Clear Bass",
    count: 1,
    slug: "bluetooth-speakers",
    image: "/images/categories/speakers.png",
  },
  {
    name: "Power Bank Fast Charge Technology",
    count: 1,
    slug: "power-banks",
    image: "/images/categories/powerbanks.png",
  },
  {
    name: "Smart Watch with Calling",
    count: 1,
    slug: "smart-watches",
    image: "/images/categories/watches.png",
  },
  {
    name: "Data Cable Fast Charge Technology",
    count: 34,
    slug: "data-cables",
    image: "/images/categories/cables.png",
  },
];

export default function ProductCategoryGrid() {
  return (
    <section className="w-full bg-white py-12 dark:bg-zinc-900/10 font-sans border-t border-zinc-100 dark:border-zinc-800/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col items-center text-center mb-10">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
            Featured Collections
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-zinc-900 dark:text-white mt-1.5">
            Shop by Tech Category
          </h2>
          <Separator className="w-12 h-1 bg-primary mt-3 rounded-full" />
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {detailedCategories.map((item, idx) => (
            <Link
              key={idx}
              href={`/categories/${item.slug}`}
              className="group flex flex-col items-center text-center"
            >
              {/* Product Category Image */}
              <div className="relative overflow-hidden aspect-square w-full rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center p-4 transition-all duration-300 group-hover:shadow-md group-hover:border-zinc-200 dark:bg-zinc-800/20 dark:border-zinc-800/60 dark:group-hover:border-zinc-700">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={160}
                  height={160}
                  className="object-contain max-h-[120px] w-auto transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Title & Count */}
              <div className="mt-4 flex flex-col items-center px-1">
                <h3 className="text-xs font-bold leading-snug text-zinc-800 dark:text-zinc-200 group-hover:text-primary transition-colors min-h-[36px] flex items-center justify-center">
                  {item.name}
                </h3>
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wide">
                  {item.count} {item.count === 1 ? "product" : "products"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
