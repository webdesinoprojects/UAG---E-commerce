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
  X,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogClose,
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
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-zinc-950/70 supports-backdrop-filter:backdrop-blur-md dark:bg-black/80"
          className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-zinc-950 p-0 text-white shadow-2xl ring-1 ring-white/10 sm:w-[92vw] sm:max-w-[42rem] md:max-w-[48rem] lg:max-w-[62rem] xl:max-w-[66rem]"
        >
          {selectedItem && (
            <div
              className="relative overflow-hidden rounded-[inherit]"
              style={{
                background: `radial-gradient(circle at 24% 45%, ${selectedItem.accentColor}24, transparent 34%), linear-gradient(135deg, #050506 0%, #111315 100%)`,
              }}
            >
              <DialogClose asChild>
                <button
                  type="button"
                  className="absolute top-3 right-3 z-30 flex h-11 w-11 items-center justify-center rounded-xl border bg-zinc-950/80 text-white shadow-lg transition hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  style={{
                    borderColor: `${selectedItem.accentColor}88`,
                    boxShadow: `0 0 0 4px ${selectedItem.accentColor}22`,
                  }}
                  aria-label="Close showcase popup"
                >
                  <X className="h-5 w-5" />
                </button>
              </DialogClose>

              <div className="relative z-10 grid gap-5 p-4 sm:gap-6 sm:p-6 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(20rem,1fr)] lg:gap-8 lg:p-8">
                <div className="relative flex min-h-[14rem] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-inner sm:min-h-[18rem] lg:min-h-[31rem]">
                  <div
                    className="pointer-events-none absolute inset-x-8 bottom-12 h-24 rounded-full blur-3xl"
                    style={{ backgroundColor: `${selectedItem.accentColor}22` }}
                  />
                  <div className="relative z-10 aspect-square w-full max-w-[22rem] overflow-hidden rounded-md bg-white shadow-2xl ring-1 ring-white/20 sm:max-w-[28rem] lg:max-w-full">
                    <Image
                      src={selectedItem.imageUrl}
                      alt={selectedItem.imageAlt}
                      fill
                      className="object-contain p-2 transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 640px) 80vw, (max-width: 1024px) 28rem, 30vw"
                    />
                  </div>
                </div>

                <div className="flex min-w-0 flex-col justify-between py-1 lg:py-6">
                  <div className="min-w-0">
                    <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-xs font-black uppercase text-zinc-100 shadow-sm">
                      {React.createElement(
                        tileIconMap[selectedItem.tileType] ?? Zap,
                        {
                          className: "h-4 w-4 shrink-0",
                          style: { color: selectedItem.accentColor },
                        },
                      )}
                      <span className="truncate">{selectedItem.badgeText}</span>
                    </div>

                    <DialogHeader className="min-w-0 border-none bg-transparent p-0">
                      <DialogTitle className="max-w-full break-words text-3xl leading-none font-black text-white uppercase font-heading sm:text-4xl lg:text-5xl">
                        {selectedItem.title}
                      </DialogTitle>
                      <DialogDescription
                        className="mt-4 break-words text-lg leading-tight font-extrabold font-heading sm:text-xl"
                        style={{ color: selectedItem.accentColor }}
                      >
                        {selectedItem.subtitle}
                      </DialogDescription>
                    </DialogHeader>

                    {selectedItem.body && (
                      <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 lg:mt-6 lg:max-w-sm">
                        {selectedItem.body}
                      </p>
                    )}

                    <div className="mt-7 border-t border-white/10 pt-6">
                      <h4 className="mb-4 text-xs font-black text-zinc-100 uppercase font-heading">
                        Showcase Details
                      </h4>
                      <ul className="space-y-3">
                        {[
                          { label: "Tile type", value: selectedItem.tileType },
                          { label: "Layout", value: selectedItem.layout },
                          { label: "Destination", value: selectedItem.href },
                        ].map((detail) => (
                          <li
                            key={detail.label}
                            className="grid grid-cols-[1.4rem_minmax(0,1fr)] gap-3 text-sm leading-snug text-zinc-100"
                          >
                            <span
                              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                              style={{
                                borderColor: `${selectedItem.accentColor}55`,
                                color: selectedItem.accentColor,
                                backgroundColor: `${selectedItem.accentColor}16`,
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </span>
                            <span className="min-w-0">
                              <span className="font-semibold">
                                {detail.label}:
                              </span>{" "}
                              <span className="break-words text-zinc-200 [overflow-wrap:anywhere]">
                                {detail.value}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-6">
                    <Link
                      href={selectedItem.href}
                      className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-black whitespace-nowrap text-zinc-950 uppercase shadow-lg transition hover:brightness-110 active:scale-[0.98] lg:w-auto lg:min-w-52"
                      style={{
                        backgroundColor: selectedItem.accentColor,
                        boxShadow: `0 18px 40px -22px ${selectedItem.accentColor}`,
                      }}
                    >
                      <ShoppingBag className="h-5 w-5" />
                      {selectedItem.ctaLabel || "View Details"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
