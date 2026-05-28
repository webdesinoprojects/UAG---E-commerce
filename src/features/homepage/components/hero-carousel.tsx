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
    title: "EARBUDS 300 LITE",
    subtitle: "Cybernetic Sound & Extra Bass",
    description: "Engineered for maximum sound isolation and heavy tactical environments. Complete with integrated case display control.",
    image: "/images/carousel/banner1.png",
    accent: "text-amber-400 border-amber-400/20",
    features: [
      { text: "Active Noise Cancellation", icon: Volume2 },
      { text: "Sound Extra Bass Boost", icon: Sparkles },
    ],
  },
  {
    id: 2,
    title: "PORTABLE SPEAKERS",
    subtitle: "Powerful Audio & Ambient Glow",
    description: "Take the power of studio-grade acoustics anywhere. Rugged waterproof chassis with synchronized LED rings.",
    image: "/images/carousel/banner2.png",
    accent: "text-red-500 border-red-500/20",
    features: [
      { text: "Rich Stereo Sound Output", icon: Volume2 },
      { text: "Ambient RGB Illumination", icon: Sparkles },
    ],
  },
  {
    id: 3,
    title: "TACTICAL WATCH PRO",
    subtitle: "Military Grade Smart Watch",
    description: "Built to survive extreme conditions. Real-time biometric tracking, built-in GPS, and a robust battery life of 30 days.",
    image: "/images/carousel/banner1.png",
    accent: "text-emerald-400 border-emerald-400/20",
    features: [
      { text: "Advanced Biometric Sensors", icon: Cpu },
      { text: "Impact-Resistant Bezel", icon: ShieldCheck },
    ],
  },
  {
    id: 4,
    title: "POWER CORE SOLAR",
    subtitle: "Heavy Duty Power Storage",
    description: "High capacity cells wrapped in shockproof silicone. Dual solar panels keep you charged up far off the grid.",
    image: "/images/carousel/banner2.png",
    accent: "text-orange-500 border-orange-500/20",
    features: [
      { text: "Fast Charge Tech", icon: Zap },
      { text: "Built-In LED Flashlight", icon: Sparkles },
    ],
  },
  {
    id: 5,
    title: "ARMOUR SPEED CABLE",
    subtitle: "Indestructible Braided USB-C",
    description: "Reinforced with bulletproof fiber core. Supports up to 240W Power Delivery and high-speed data sync.",
    image: "/images/carousel/banner1.png",
    accent: "text-blue-400 border-blue-400/20",
    features: [
      { text: "240W Power Delivery", icon: Zap },
      { text: "Kevlar Braided Shell", icon: Link2 },
    ],
  },
  {
    id: 6,
    title: "AIRDOPES STUDIO ANC",
    subtitle: "True Wireless Sound Shield",
    description: "Escape the noise. Hybrid ANC technology blocks out 40dB of ambient noise while preserving pristine vocals.",
    image: "/images/carousel/banner2.png",
    accent: "text-purple-400 border-purple-400/20",
    features: [
      { text: "40dB Hybrid ANC", icon: Volume2 },
      { text: "Low Latency Gaming Mode", icon: Cpu },
    ],
  },
  {
    id: 7,
    title: "OMNI PARTY SPEAKER",
    subtitle: "Ambient Audio Environment",
    description: "Double subwoofers deliver rich, thumping bass. Perfect for large open areas, outdoor events, and home theaters.",
    image: "/images/carousel/banner2.png",
    accent: "text-pink-500 border-pink-500/20",
    features: [
      { text: "Wireless Stereo Pairing", icon: Bluetooth },
      { text: "Rechargeable 24hr Battery", icon: Zap },
    ],
  },
  {
    id: 8,
    title: "UAG ELITE ECOSYSTEM",
    subtitle: "Complete Connected Gear",
    description: "Elevate your tech setup with matching protective cases, durable charging bricks, and premium wireless sound.",
    image: "/images/carousel/banner1.png",
    accent: "text-amber-400 border-amber-400/20",
    features: [
      { text: "Device Protection Shield", icon: ShieldCheck },
      { text: "Sleek Industrial Aesthetics", icon: Cpu },
    ],
  },
];

export default function HeroCarousel() {
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
    const duration = 5000; // 5 seconds slide time
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
                    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${slide.accent}`}>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                      </span>
                      <span>Product Launch</span>
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
                        const Icon = feat.icon;
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
                      <Button className="font-semibold px-6 h-11 bg-white hover:bg-zinc-100 text-zinc-950 rounded-xl transition-all shadow-md active:scale-95">
                        Explore Now
                      </Button>
                      <Button variant="outline" className="font-semibold px-6 h-11 border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-white rounded-xl transition-all active:scale-95">
                        View Details
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
