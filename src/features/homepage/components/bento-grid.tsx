"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Check,
  Cpu,
  GalleryVerticalEnd,
  ShieldCheck,
  ShoppingBag,
  X,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
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

  const emptySlotCount = Math.max(0, 12 - bentoGallery.items.length);

  return (
    <section className="mb-1 w-full border-t border-zinc-100 bg-white pt-12 pb-0 font-sans dark:border-zinc-800/80 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {bentoGallery.items.map((item) => {
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative block aspect-square w-full overflow-hidden bg-transparent text-left"
                aria-label={`View ${item.title}`}
              >
                <Image src={item.imageUrl} alt={item.imageAlt} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-contain transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
              </button>
            );
          })}
          {Array.from({ length: emptySlotCount }, (_, index) => (
            <div
              key={`empty-gallery-slot-${index}`}
              className="relative aspect-square w-full bg-transparent"
              aria-hidden="true"
            />
          ))}
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
