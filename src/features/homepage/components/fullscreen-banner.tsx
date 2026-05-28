"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Sparkles, Cpu, ShieldCheck, Zap, Volume2, Bluetooth, Link2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    title: "EARBUDS 300 PRO",
    subtitle: "Cybernetic Sound & Hybrid ANC",
    description: "Experience premium active noise cancellation and thumping dual bass drivers. Encased in a rugged tactical armor chassis with integrated LED charge display.",
    image: "/images/carousel/banner1.png",
    accent: "bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-amber-400/20",
    badgeBorder: "border-amber-400/20 text-amber-400",
    features: [
      { text: "40dB Hybrid ANC", icon: Volume2 },
      { text: "BassBoost Driver", icon: Sparkles },
    ],
  },
  {
    id: 2,
    title: "OMNI SPEAKER BEAT",
    subtitle: "High Definition Audio & Light Sync",
    description: "Double subwoofers deliver cinematic, room-filling sound. Dustproof and waterproof IPX7 chassis with customizable dual LED ring visualizers.",
    image: "/images/carousel/banner2.png",
    accent: "bg-red-600 text-white hover:bg-red-500 shadow-red-600/20",
    badgeBorder: "border-red-500/20 text-red-500",
    features: [
      { text: "Rich Stereo System", icon: Volume2 },
      { text: "Reactive Ambient Glow", icon: Sparkles },
    ],
  },
  {
    id: 3,
    title: "TACTICAL WATCH V2",
    subtitle: "Military Spec Biometric Watch",
    description: "Built to survive extreme conditions. Real-time dynamic heart rate monitoring, body temperature scanning, GPS tracker, and 30-day battery cell.",
    image: "/images/carousel/banner1.png",
    accent: "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-emerald-500/20",
    badgeBorder: "border-emerald-400/20 text-emerald-400",
    features: [
      { text: "Biometric Tracking", icon: Cpu },
      { text: "Mil-Spec Durability", icon: ShieldCheck },
    ],
  },
  {
    id: 4,
    title: "SOLAR FORCE CORE",
    subtitle: "Outdoor Heavy Duty Power Bank",
    description: "Ultra-high 50,000mAh solar charging cell. Wrapped in impact-absorbing shockproof housing with high power dual flashlight systems.",
    image: "/images/carousel/banner2.png",
    accent: "bg-orange-500 text-zinc-950 hover:bg-orange-450 shadow-orange-500/20",
    badgeBorder: "border-orange-500/20 text-orange-500",
    features: [
      { text: "Fast Charge Output", icon: Zap },
      { text: "Twin Solar Panels", icon: Sparkles },
    ],
  },
  {
    id: 5,
    title: "KIP ARMOUR SPEED",
    subtitle: "Reinforced Braided USB-C Cable",
    description: "Constructed with dual-braided ballistic nylon and reinforced aramid fiber. Handles heavy 240W Power Delivery and high throughput data rates.",
    image: "/images/carousel/banner1.png",
    accent: "bg-blue-500 text-white hover:bg-blue-400 shadow-blue-500/20",
    badgeBorder: "border-blue-400/20 text-blue-400",
    features: [
      { text: "240W Power Delivery", icon: Zap },
      { text: "Ballistic Nylon Shell", icon: Link2 },
    ],
  },
];

export default function FullscreenBanner() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Monitor visibility and motion safety
  useEffect(() => {
    const handleVisibility = () => setIsTabHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", motionListener);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      mediaQuery.removeEventListener("change", motionListener);
    };
  }, []);

  // Sync index and handle pointer triggers
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

  // Autoplay & Progress Timer Loop (Slowed down to 7.5 seconds)
  useEffect(() => {
    if (isReducedMotion || !api) return;

    const intervalTime = 30; // 30ms updates for 33fps animations
    const duration = 7500; // Slow auto scroll (7.5 seconds per slide)
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
  }, [api, isPaused, isDragging, isTabHidden, isReducedMotion]);

  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);
  const handleFocus = useCallback(() => setIsPaused(true), []);
  const handleBlur = useCallback(() => setIsPaused(false), []);

  return (
    <section className="relative w-full bg-zinc-950 overflow-hidden font-sans border-b border-zinc-900 mb-12 md:mb-16">
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
        className="w-full font-sans"
      >
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => {
            const isLCP = index === 0;

            return (
              <CarouselItem key={slide.id} className="pl-0 relative w-full h-[calc(100vh-4.5rem)] min-h-[500px]">
                {/* Background Image with Masks */}
                <div className="absolute inset-0 z-0 select-none">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    sizes="100vw"
                    className="object-cover object-right md:object-center select-none"
                    // First image can be preloaded as LCP (only one per page is preloaded; 
                    // since page LCP is already banner1 above, we load this banner normally/lazy to avoid duplicate resource preloads)
                    loading="lazy"
                  />
                  {/* Heavy, high-contrast dark masks for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent z-10" />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent z-10" />
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-zinc-950/40 to-transparent z-10" />
                </div>

                {/* Left Aligned Content Overlay */}
                <div className="absolute inset-0 z-20 flex items-center pointer-events-none">
                  <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
                    
                    {/* Glassmorphic Tech info card (keeps buttons and details highly visible) */}
                    <div className="max-w-xl md:max-w-2xl bg-zinc-950/40 backdrop-blur-xs border border-white/5 rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col items-start gap-4 md:gap-6 shadow-2xl pointer-events-auto">
                      
                      {/* Sub-badge */}
                      <div className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.25 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${slide.badgeBorder}`}>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                        </span>
                        <span>EXCLUSIVE LAUNCH</span>
                      </div>

                      {/* Header Titles */}
                      <div className="flex flex-col gap-2">
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white leading-none">
                          {slide.title}
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl font-bold font-heading tracking-wide text-zinc-300">
                          {slide.subtitle}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 font-body max-w-lg">
                        {slide.description}
                      </p>

                      {/* Features Row */}
                      <div className="hidden sm:flex flex-wrap items-center gap-5 mt-1">
                        {slide.features.map((feat, fidx) => {
                          const Icon = feat.icon;
                          return (
                            <div key={fidx} className="flex items-center gap-2 text-[10px] font-extrabold tracking-wider text-zinc-300 uppercase">
                              <Icon className="h-4.5 w-4.5 text-zinc-500" />
                              <span>{feat.text}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Shadcn Buttons section with Buy Now highlight */}
                      <div className="flex items-center gap-3.5 mt-2 sm:mt-4">
                        {/* Highlighted Buy Now button */}
                        <Button 
                          className={`font-black tracking-widest text-xs uppercase px-8 h-12 rounded-xl transition-all active:scale-95 shadow-lg ${slide.accent}`}
                          asChild
                        >
                          <a href={`/products/${slide.id}`}>
                            Buy Now
                          </a>
                        </Button>

                        {/* Secondary outline button */}
                        <Button 
                          variant="outline" 
                          className="font-bold tracking-wider text-xs uppercase px-6 h-12 border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/80 text-zinc-300 hover:text-white rounded-xl transition-all active:scale-95"
                          asChild
                        >
                          <a href={`/products/${slide.id}`}>
                            Specifications
                          </a>
                        </Button>
                      </div>

                    </div>

                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Minimalist Index Indicator */}
        <div className="absolute top-6 right-6 md:right-10 z-30 bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xs text-white text-xs font-bold font-mono px-3.5 py-1.5 rounded-full select-none tracking-widest shadow-xs">
          {selectedIndex + 1} / {slides.length}
        </div>

        {/* Slow-autoplay Timer Progress Line */}
        {!isReducedMotion && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-950/80 z-30">
            <div
              className="h-full bg-amber-400 transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                transitionProperty: progress === 0 ? "none" : "width",
              }}
            />
          </div>
        )}
      </Carousel>
    </section>
  );
}
