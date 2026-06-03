"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  Zap,
  Volume2,
  Bluetooth,
  Link2,
  Check,
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
  HomepageHeroCarousel,
} from "@/features/homepage/types";

// Maps the validated icon name from the DTO to a Lucide icon. Falls back to a
// neutral icon if an unknown name ever slips through.
const featureIconMap = {
  volume: Volume2,
  sparkles: Sparkles,
  cpu: Cpu,
  shield: ShieldCheck,
  zap: Zap,
  bluetooth: Bluetooth,
  link: Link2,
  check: Check,
} satisfies Record<HeroFeatureIcon, typeof Sparkles>;

interface HeroCarouselProps {
  heroCarousel: HomepageHeroCarousel;
}

export default function HeroCarousel({ heroCarousel }: HeroCarouselProps) {
  const slides = heroCarousel.slides.filter((slide) => slide.isEnabled);

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Monitor visibility state
  useEffect(() => {
    const handleVisibility = () => setIsTabHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReducedMotion(mediaQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", motionListener);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      mediaQuery.removeEventListener("change", motionListener);
    };
  }, []);

  // Sync index and handle interaction pauses
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

  // Autoplay & Progress Timer Loop
  useEffect(() => {
    if (isReducedMotion || !api) return;

    const intervalTime = 30; // 30ms steps for 33fps smoothness
    const duration = heroCarousel.autoplaySeconds * 1000; // admin-controlled slide time
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      if (isPaused || isDragging || isTabHidden) return;

      setProgress((prev) => {
        if (prev >= 100) {
          api.scrollNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [api, isPaused, isDragging, isTabHidden, isReducedMotion, heroCarousel.autoplaySeconds]);

  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);
  const handleFocus = useCallback(() => setIsPaused(true), []);
  const handleBlur = useCallback(() => setIsPaused(false), []);

  if (!heroCarousel.isEnabled || slides.length === 0) {
    return null;
  }

  const activeAccent = slides[selectedIndex]?.accentColor ?? "#fbbf24";

  return (
    <section className="relative w-full bg-zinc-950 overflow-hidden font-sans border-b border-zinc-900">
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
          align: "start",
          skipSnaps: false,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocusCapture={handleFocus}
        onBlurCapture={handleBlur}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => {
            const isLCP = index === 0;

            return (
              <CarouselItem key={slide.id} className="pl-0 relative w-full h-[500px] md:h-[600px]">
                {/* Background Image Container */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    sizes="100vw"
                    className="object-cover object-right md:object-center select-none"
                    preload={isLCP ? true : undefined}
                    loading={isLCP ? undefined : "lazy"}
                  />
                  {/* Premium Ambient Dark Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-10" />
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-zinc-950/40 to-transparent z-10" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 z-20 flex items-center pointer-events-none">
                  <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex flex-col items-start gap-4 md:gap-6 pointer-events-auto">

                    {/* Badge Category */}
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                      style={{
                        color: slide.accentColor,
                        borderColor: `${slide.accentColor}33`,
                      }}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                      </span>
                      <span>{slide.badgeText}</span>
                    </div>

                    {/* Titles */}
                    <div className="flex flex-col gap-1.5 max-w-lg md:max-w-2xl">
                      <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white leading-none">
                        {slide.title}
                      </h2>
                      <p className="text-lg sm:text-xl font-bold font-heading tracking-wide text-zinc-300">
                        {slide.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="max-w-md sm:max-w-lg text-sm sm:text-base leading-relaxed text-zinc-400 font-body">
                      {slide.description}
                    </p>

                    {/* Features list */}
                    <div className="hidden sm:flex flex-wrap items-center gap-6 mt-2">
                      {slide.features.map((feat, fidx) => {
                        const Icon = featureIconMap[feat.icon] ?? Sparkles;
                        return (
                          <div key={fidx} className="flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                            <Icon className="h-4.5 w-4.5 text-zinc-500" />
                            <span>{feat.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3.5 mt-4">
                      <Button asChild className="font-semibold px-6 h-11 bg-white hover:bg-zinc-100 text-zinc-950 rounded-xl transition-all shadow-md active:scale-95">
                        <Link href={slide.primaryCtaHref}>{slide.primaryCtaLabel}</Link>
                      </Button>
                      <Button asChild variant="outline" className="font-semibold px-6 h-11 border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-white rounded-xl transition-all active:scale-95">
                        <Link href={slide.secondaryCtaHref}>{slide.secondaryCtaLabel}</Link>
                      </Button>
                    </div>

                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Minimalist Status Index Indicator in Top Right */}
        <div className="absolute top-6 right-6 md:right-10 z-30 bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xs text-white text-xs font-bold font-mono px-3.5 py-1.5 rounded-full select-none tracking-widest shadow-xs">
          {selectedIndex + 1} / {slides.length}
        </div>

        {/* Bottom Timer Progress Line */}
        {!isReducedMotion && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900 z-30">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: activeAccent,
                transitionProperty: progress === 0 ? "none" : "width",
              }}
            />
          </div>
        )}
      </Carousel>
    </section>
  );
}
