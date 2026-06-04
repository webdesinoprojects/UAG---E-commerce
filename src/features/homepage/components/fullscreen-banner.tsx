"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bluetooth,
  Check,
  Cpu,
  Link2,
  ShieldCheck,
  Sparkles,
  Volume2,
  Zap,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import type {
  HeroFeatureIcon,
  HomepageMerchandisingBanners,
} from "@/features/homepage/types";

const featureIconMap: Record<HeroFeatureIcon, typeof Sparkles> = {
  volume: Volume2,
  sparkles: Sparkles,
  cpu: Cpu,
  shield: ShieldCheck,
  zap: Zap,
  bluetooth: Bluetooth,
  link: Link2,
  check: Check,
};

export default function FullscreenBanner({
  merchandisingBanners,
}: {
  merchandisingBanners: HomepageMerchandisingBanners;
}) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const slides = merchandisingBanners.slides;

  useEffect(() => {
    const handleVisibility = () => setIsTabHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReducedMotion(mediaQuery.matches);
    const motionListener = (event: MediaQueryListEvent) =>
      setIsReducedMotion(event.matches);
    mediaQuery.addEventListener("change", motionListener);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      mediaQuery.removeEventListener("change", motionListener);
    };
  }, []);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
      setProgress(0);
    };

    const onPointerDown = () => setIsDragging(true);
    const onPointerUp = () => setIsDragging(false);

    api.on("select", onSelect);
    api.on("pointerDown", onPointerDown);
    api.on("pointerUp", onPointerUp);

    return () => {
      api.off("select", onSelect);
      api.off("pointerDown", onPointerDown);
      api.off("pointerUp", onPointerUp);
    };
  }, [api]);

  useEffect(() => {
    if (isReducedMotion || !api || slides.length <= 1) return;

    const intervalTime = 30;
    const duration = merchandisingBanners.autoplaySeconds * 1000;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      if (isPaused || isDragging || isTabHidden) return;

      setProgress((previous) => {
        if (previous >= 100) {
          api.scrollNext();
          return 0;
        }
        return previous + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [
    api,
    isPaused,
    isDragging,
    isTabHidden,
    isReducedMotion,
    merchandisingBanners.autoplaySeconds,
    slides.length,
  ]);

  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);
  const handleFocus = useCallback(() => setIsPaused(true), []);
  const handleBlur = useCallback(() => setIsPaused(false), []);

  if (!merchandisingBanners.isEnabled || slides.length === 0) {
    return null;
  }

  return (
    <section className="relative mb-12 w-full overflow-hidden border-b border-zinc-900 bg-zinc-950 font-sans md:mb-16">
      <Carousel
        setApi={setApi}
        opts={{
          loop: slides.length > 1,
          align: "start",
          skipSnaps: false,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocusCapture={handleFocus}
        onBlurCapture={handleBlur}
        className="w-full font-sans"
      >
        <CarouselContent className="ml-0">
          {slides.map((slide) => (
            <CarouselItem
              key={slide.id}
              className="relative h-[calc(100vh-4.5rem)] min-h-[500px] w-full pl-0"
            >
              <div className="absolute inset-0 z-0 select-none">
                <Image
                  src={slide.imageUrl}
                  alt={slide.imageAlt}
                  fill
                  sizes="100vw"
                  className="object-cover object-right select-none md:object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-zinc-950 to-transparent" />
                <div className="absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-zinc-950/40 to-transparent" />
              </div>

              <div className="pointer-events-none absolute inset-0 z-20 flex items-center">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="pointer-events-auto flex max-w-xl flex-col items-start gap-4 rounded-3xl border border-white/5 bg-zinc-950/40 p-6 shadow-2xl backdrop-blur-xs sm:p-8 md:max-w-2xl md:gap-6 md:p-10">
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[10px] font-bold tracking-wider uppercase sm:text-xs"
                      style={{
                        borderColor: `${slide.accentColor}33`,
                        color: slide.accentColor,
                      }}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span
                          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                          style={{ backgroundColor: slide.accentColor }}
                        />
                        <span
                          className="relative inline-flex h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: slide.accentColor }}
                        />
                      </span>
                      <span>{slide.badgeText || merchandisingBanners.eyebrow}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-3xl font-black leading-none tracking-tight text-white font-display sm:text-5xl md:text-6xl">
                        {slide.title}
                      </h2>
                      <p className="text-base font-bold tracking-wide text-zinc-300 font-heading sm:text-lg md:text-xl">
                        {slide.subtitle}
                      </p>
                    </div>

                    <p className="max-w-lg text-xs leading-relaxed text-zinc-400 sm:text-sm">
                      {slide.body}
                    </p>

                    {slide.features.length > 0 && (
                      <div className="mt-1 hidden flex-wrap items-center gap-5 sm:flex">
                        {slide.features.map((feature) => {
                          const Icon = featureIconMap[feature.icon] ?? Sparkles;
                          return (
                            <div
                              key={`${slide.id}-${feature.text}`}
                              className="flex items-center gap-2 text-[10px] font-extrabold tracking-wider text-zinc-300 uppercase"
                            >
                              <Icon className="h-4.5 w-4.5 text-zinc-500" />
                              <span>{feature.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-3.5 sm:mt-4">
                      <Button
                        className="h-12 rounded-xl px-8 text-xs font-black tracking-widest text-zinc-950 uppercase shadow-lg transition-all active:scale-95"
                        style={{
                          backgroundColor: slide.accentColor,
                          boxShadow: `0 18px 40px ${slide.accentColor}22`,
                        }}
                        asChild
                      >
                        <Link href={slide.primaryCtaHref}>
                          {slide.primaryCtaLabel}
                        </Link>
                      </Button>

                      {slide.secondaryCtaLabel && slide.secondaryCtaHref && (
                        <Button
                          variant="outline"
                          className="h-12 rounded-xl border-zinc-800 bg-zinc-900/40 px-6 text-xs font-bold tracking-wider text-zinc-300 uppercase transition-all hover:border-zinc-700 hover:bg-zinc-900/80 hover:text-white active:scale-95"
                          asChild
                        >
                          <Link href={slide.secondaryCtaHref}>
                            {slide.secondaryCtaLabel}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute top-6 right-6 z-30 rounded-full border border-zinc-800/80 bg-zinc-900/70 px-3.5 py-1.5 font-mono text-xs font-bold tracking-widest text-white shadow-xs backdrop-blur-xs select-none md:right-10">
          {selectedIndex + 1} / {slides.length}
        </div>

        {!isReducedMotion && slides.length > 1 && (
          <div className="absolute right-0 bottom-0 left-0 z-30 h-1 bg-zinc-950/80">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: slides[selectedIndex]?.accentColor ?? "#fbbf24",
                transitionProperty: progress === 0 ? "none" : "width",
              }}
            />
          </div>
        )}
      </Carousel>
    </section>
  );
}
