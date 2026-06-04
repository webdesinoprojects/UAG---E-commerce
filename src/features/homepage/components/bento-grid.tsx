"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Check,
  Cpu,
  GalleryVerticalEnd,
  ShieldCheck,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  BentoTileLayout,
  BentoTileType,
  HomepageBentoGallery,
  HomepageBentoItem,
} from "@/features/homepage/types";

const tileIconMap: Record<BentoTileType, typeof ShieldCheck> = {
  product: ShieldCheck,
  banner: Activity,
  story: GalleryVerticalEnd,
  category: Cpu,
};

const fallbackLayoutClass: Record<BentoTileLayout, string> = {
  large: "col-span-2 row-span-2 md:col-span-2 md:row-span-2",
  wide: "col-span-2 row-span-1 md:col-span-2 md:row-span-1",
  tall: "col-span-1 row-span-2 md:col-span-1 md:row-span-2",
  standard: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
};

function getLayoutClass(item: HomepageBentoItem) {
  return fallbackLayoutClass[item.layout] ?? fallbackLayoutClass.standard;
}

export default function BentoGrid({
  bentoGallery,
}: {
  bentoGallery: HomepageBentoGallery;
}) {
  const [selectedItem, setSelectedItem] =
    React.useState<HomepageBentoItem | null>(null);

  if (!bentoGallery.isEnabled || bentoGallery.items.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 w-full border-t border-zinc-100 bg-white py-12 font-sans dark:border-zinc-800/80 dark:bg-zinc-950 md:mb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center text-center select-none">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-primary">
            {bentoGallery.eyebrow}
          </span>
          <h2 className="mt-1.5 text-2xl font-black text-zinc-900 font-heading sm:text-3xl dark:text-white">
            {bentoGallery.heading}
          </h2>
          {bentoGallery.description && (
            <p className="mt-2 max-w-2xl text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {bentoGallery.description}
            </p>
          )}
          <Separator className="mt-3 h-1 w-12 rounded-full bg-primary" />
        </div>

        <div className="grid auto-rows-[160px] grid-cols-2 grid-flow-dense gap-3 sm:auto-rows-[220px] sm:gap-4 md:grid-cols-3 md:auto-rows-[280px] lg:gap-6">
          {bentoGallery.items.map((item) => {
            const Icon = tileIconMap[item.tileType] ?? Zap;

            return (
              <Card
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4 text-white transition-all duration-500 ease-out hover:scale-[1.01] hover:border-zinc-700 hover:shadow-xl active:scale-[0.995] sm:rounded-3xl sm:p-6 ${getLayoutClass(item)}`}
              >
                <div className="absolute inset-0 z-0 select-none">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/30" />
                </div>

                <div className="relative z-20 flex h-full w-full flex-col justify-between pointer-events-none">
                  <div className="flex w-full items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-zinc-300 sm:px-2.5 sm:text-[9px]">
                      <Icon
                        className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                        style={{ color: item.accentColor }}
                      />
                      <span>{item.badgeText}</span>
                    </div>

                    <Link
                      href={item.href}
                      onClick={(event) => event.stopPropagation()}
                      className="pointer-events-auto flex h-6 w-6 scale-90 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white opacity-0 backdrop-blur-xs transition-all duration-300 hover:border-transparent hover:text-zinc-950 group-hover:scale-100 group-hover:opacity-100 sm:h-7 sm:w-7"
                      style={{ backgroundColor: item.accentColor }}
                      aria-label={`Open ${item.title}`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>
                  </div>

                  <div className="mt-auto">
                    <h3 className="text-xs font-black leading-none tracking-wider uppercase sm:text-sm">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[10px] font-bold leading-none text-zinc-300 font-heading sm:text-xs">
                      {item.subtitle}
                    </p>
                    {item.body && (
                      <p className="mt-2 hidden max-w-sm text-[9px] leading-relaxed text-zinc-400 sm:line-clamp-2 sm:block md:line-clamp-none">
                        {item.body}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        <DialogContent className="max-h-[90vh] w-[92vw] max-w-4xl overflow-y-auto rounded-3xl border-zinc-900 bg-zinc-950 p-6 text-white ring-1 ring-zinc-800 backdrop-blur-xl sm:p-8">
          {selectedItem && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              <div className="relative flex min-h-[250px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/40 p-4 sm:min-h-[300px]">
                <div
                  className="pointer-events-none absolute h-48 w-48 rounded-full blur-3xl"
                  style={{ backgroundColor: `${selectedItem.accentColor}22` }}
                />
                <div className="relative z-10 flex aspect-square w-full items-center justify-center">
                  <Image
                    src={selectedItem.imageUrl}
                    alt={selectedItem.imageAlt}
                    fill
                    className="object-contain p-2 transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    {React.createElement(tileIconMap[selectedItem.tileType] ?? Zap, {
                      className: "h-3.5 w-3.5",
                      style: { color: selectedItem.accentColor },
                    })}
                    <span>{selectedItem.badgeText}</span>
                  </div>

                  <DialogHeader className="border-none bg-transparent p-0">
                    <DialogTitle className="text-2xl font-black leading-none tracking-wide text-white uppercase font-heading sm:text-3xl">
                      {selectedItem.title}
                    </DialogTitle>
                    <DialogDescription
                      className="mt-1 text-sm font-semibold font-heading"
                      style={{ color: selectedItem.accentColor }}
                    >
                      {selectedItem.subtitle}
                    </DialogDescription>
                  </DialogHeader>

                  <p className="mt-4 text-xs leading-relaxed text-zinc-400">
                    {selectedItem.body}
                  </p>

                  <div className="mt-6 border-t border-zinc-900 pt-5">
                    <h4 className="mb-3 text-xs font-black tracking-wider text-zinc-300 uppercase">
                      Showcase Details
                    </h4>
                    <ul className="space-y-2">
                      {[
                        `Tile type: ${selectedItem.tileType}`,
                        `Layout: ${selectedItem.layout}`,
                        `Destination: ${selectedItem.href}`,
                      ].map((detail) => (
                        <li
                          key={detail}
                          className="flex items-start gap-2.5 text-xs text-zinc-300"
                        >
                          <span
                            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                            style={{
                              borderColor: `${selectedItem.accentColor}44`,
                              color: selectedItem.accentColor,
                              backgroundColor: `${selectedItem.accentColor}14`,
                            }}
                          >
                            <Check className="h-2.5 w-2.5" />
                          </span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 border-t border-zinc-900 pt-5">
                  <Link
                    href={selectedItem.href}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold tracking-wider text-zinc-950 uppercase transition-all duration-200 active:scale-[0.98]"
                    style={{ backgroundColor: selectedItem.accentColor }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {selectedItem.ctaLabel || "View Details"}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
