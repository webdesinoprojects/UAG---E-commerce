"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { HomepageCategoryCircles } from "@/features/homepage/types";

export default function CategoryCircles({
  categoryCircles,
}: {
  categoryCircles: HomepageCategoryCircles;
}) {
  if (!categoryCircles.isEnabled || categoryCircles.items.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-background py-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Scrollable Container */}
        <div 
          className="flex flex-nowrap gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory md:gap-6 md:pb-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categoryCircles.items.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group flex flex-col items-center text-center shrink-0 w-[140px] md:w-auto snap-start"
            >
              {/* Card Container */}
              <Card className="relative overflow-hidden aspect-square w-full rounded-2xl md:rounded-[2rem] border border-zinc-100 bg-zinc-50/50 p-3 shadow-xs transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-md group-hover:bg-white group-hover:border-primary/20 dark:bg-zinc-900/10 dark:border-zinc-800/40 dark:group-hover:bg-zinc-900/40">
                <div className="relative h-full w-full flex items-center justify-center">
                  <Image
                    src={category.imageUrl}
                    alt={category.imageAlt}
                    width={200}
                    height={200}
                    className="object-contain h-full w-full rounded-xl mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 ease-out group-hover:rotate-1"
                    loading="lazy"
                  />
                  {category.hoverMediaUrl && category.hoverMediaMimeType?.startsWith("video/") && (
                    <video
                      src={category.hoverMediaUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-xl"
                    />
                  )}
                  {category.hoverMediaUrl && !category.hoverMediaMimeType?.startsWith("video/") && (
                    <Image
                      src={category.hoverMediaUrl}
                      alt={`${category.imageAlt} Hover`}
                      fill
                      className="object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-xl"
                    />
                  )}
                </div>
              </Card>

              {/* Text Information */}
              <div className="mt-3 flex flex-col items-center">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors">
                  {category.name}
                </span>
                <span className="mt-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  {category.productCount} {category.productCount === 1 ? "Product" : "Products"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
