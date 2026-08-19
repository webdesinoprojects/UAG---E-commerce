"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { getOriginalImageKitVideoUrl } from "@/features/media/imagekit-url";
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

const CONTENT_HIDDEN_MARKER = "#content-hidden";

interface HeroCarouselProps {
  heroCarousel: HomepageHeroCarousel;
}

export default function HeroCarousel({ heroCarousel }: HeroCarouselProps) {
  const slides = heroCarousel.slides.filter((slide) => slide.isEnabled);

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const playbackPausedRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInViewportRef = useRef(false);

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
    playbackPausedRef.current = isPaused || isDragging || isTabHidden;
  }, [isPaused, isDragging, isTabHidden]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewportRef.current = entry.isIntersecting;
      },
      { rootMargin: "150px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const progressElement = progressRef.current;
    if (isReducedMotion || !api || slides.length <= 1 || !progressElement) return;

    const duration = heroCarousel.autoplaySeconds * 1000;
    let animationFrame = 0;
    let elapsed = 0;
    let previousTime = performance.now();

    progressElement.style.transform = "scaleX(0)";

    const animate = (time: number) => {
      if (!playbackPausedRef.current && isInViewportRef.current) {
        elapsed += Math.min(time - previousTime, 100);
        progressElement.style.transform = `scaleX(${Math.min(elapsed / duration, 1)})`;

        if (elapsed >= duration) {
          elapsed = 0;
          progressElement.style.transform = "scaleX(0)";
          api.scrollNext();
        }
      }

      previousTime = time;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [api, heroCarousel.autoplaySeconds, isReducedMotion, selectedIndex, slides.length]);

  const handleMouseEnter = useCallback(() => {
    if (window.matchMedia("(hover: hover)").matches) setIsPaused(true);
  }, []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);
  const handleFocus = useCallback(() => setIsPaused(true), []);
  const handleBlur = useCallback(() => setIsPaused(false), []);

  if (!heroCarousel.isEnabled || slides.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative mx-auto w-[calc(100%-2rem)] max-w-7xl overflow-hidden border-b border-zinc-900 bg-zinc-950 font-sans">
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
            const contentEnabled = !slide.secondaryCtaHref.endsWith(
              CONTENT_HIDDEN_MARKER
            );

            return (
              <CarouselItem key={slide.id} className="relative h-[62vw] max-h-[320px] w-full pl-0 md:h-[75vh] md:min-h-[480px] md:max-h-[780px]">
                {/* Background Image Container */}
                <div className="absolute inset-0 z-0">
                  {slide.mediaMimeType?.startsWith("video/") ? (
                    <video
                      src={getOriginalImageKitVideoUrl(slide.image)}
                      poster={slide.fallbackImagePath}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      aria-hidden="true"
                      className="h-full w-full object-cover object-center select-none md:object-contain md:object-bottom"
                    />
                  ) : (
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      sizes="100vw"
                      className="object-cover object-center select-none md:object-contain md:object-bottom"
                      preload={isLCP ? true : undefined}
                      loading={isLCP ? undefined : "lazy"}
                    />
                  )}
                  {contentEnabled ? (
                    <>
                      <div className="absolute inset-0 z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
                      <div className="absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-zinc-950/40 to-transparent" />
                    </>
                  ) : null}
                </div>

                {/* Content Overlay */}
                {contentEnabled ? (
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
                ) : null}
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Minimalist Status Index Indicator in Top Right */}
        <div className="absolute top-3 right-3 z-40 rounded-full border border-zinc-600 bg-black/85 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white shadow-xs backdrop-blur-xs select-none sm:text-xs">
            {selectedIndex + 1} / {slides.length}
        </div>

        {/* Bottom Timer Progress Line */}
        {!isReducedMotion && slides.length > 1 ? (
          <div className="absolute right-0 bottom-0 left-0 z-40 h-1 bg-orange-500/30">
            <div
              ref={progressRef}
              className="h-full origin-left bg-orange-500 will-change-transform"
            />
          </div>
        ) : null}
      </Carousel>
    </section>
  );
}
