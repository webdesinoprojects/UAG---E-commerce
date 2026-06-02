"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProductCard, { type Product } from "@/features/catalog/components/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";

const popularProducts: Product[] = [
  {
    id: "pop-1",
    name: "UAG Crystal Gaming ANC Transparent Deep Bass Earbuds",
    category: "Earbuds Or Airdopes ENC",
    price: 1199,
    originalPrice: 5999,
    discount: 80,
    image: "/images/categories/earbuds.png",
    slug: "uag-crystal-gaming-anc",
  },
  {
    id: "pop-2",
    name: "UAG Crystal Transparent Gaming or ANC Earbuds",
    category: "Earbuds Or Airdopes ENC",
    price: 1189,
    originalPrice: 6999,
    discount: 83,
    image: "/images/categories/earbuds.png",
    slug: "uag-crystal-transparent-gaming",
  },
  {
    id: "pop-3",
    name: "UAG Urbn Armour Gear 151ANC Airdopes",
    category: "Earbuds Or Airdopes ENC",
    price: 1099,
    originalPrice: 2999,
    discount: 63,
    image: "/images/categories/earbuds.png",
    slug: "uag-urbn-armour-151anc-white",
  },
  {
    id: "pop-4",
    name: "UAG Urbn Armour Gear 151ANC Airdopes",
    category: "Earbuds Or Airdopes ENC",
    price: 1090,
    originalPrice: 2999,
    discount: 64,
    image: "/images/categories/earbuds.png",
    slug: "uag-urbn-armour-151anc",
  },
  {
    id: "pop-5",
    name: "UAG Urbn Armour Gear 151ANC Airdopes",
    category: "Earbuds Or Airdopes ENC",
    price: 1090,
    originalPrice: 5999,
    discount: 82,
    image: "/images/categories/earbuds.png",
    slug: "uag-bass-sound-guaranteed",
  },
  {
    id: "pop-6",
    name: "UAG ActiveSync Slim Smartwatch Active",
    category: "Smart Watch with Calling",
    price: 1999,
    originalPrice: 4999,
    discount: 60,
    image: "/images/categories/watches.png",
    slug: "uag-activesync-slim-smartwatch",
  },
  {
    id: "pop-7",
    name: "UAG PowerCore Fast Charge Solar Battery",
    category: "Power Bank Fast Charge Tech",
    price: 1499,
    originalPrice: 3799,
    discount: 60,
    image: "/images/categories/powerbanks.png",
    slug: "uag-powercore-fast-charge-solar",
  },
  {
    id: "pop-8",
    name: "UAG OmniSound Portable Bluetooth Speaker",
    category: "Portable & Party Speaker with Clear Bass",
    price: 1899,
    originalPrice: 4999,
    discount: 62,
    image: "/images/categories/speakers.png",
    slug: "uag-omnisound-portable-speaker",
  },
];

export default function MostPopular() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [currentSnap, setCurrentSnap] = useState(0);

  // Monitor visibility and motion safety
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

  // Sync scroll snaps, active state, and pointer interaction
  useEffect(() => {
    if (!api) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScrollSnaps(api.scrollSnapList());
    setCurrentSnap(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrentSnap(api.selectedScrollSnap());
    };

    const onPointerDown = () => setIsDragging(true);
    const onPointerUp = () => setIsDragging(false);

    api.on("select", onSelect);
    api.on("reInit", onSelect);
    api.on("pointerDown", onPointerDown);
    api.on("pointerUp", onPointerUp);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
      api.off("pointerDown", onPointerDown);
      api.off("pointerUp", onPointerUp);
    };
  }, [api]);

  // Autoplay loop (scrolls every 5 seconds)
  useEffect(() => {
    if (isReducedMotion || !api) return;

    const timer = setInterval(() => {
      if (isPaused || isDragging || isTabHidden) return;
      api.scrollNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [api, isPaused, isDragging, isTabHidden, isReducedMotion]);

  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);
  const handleFocus = useCallback(() => setIsPaused(true), []);
  const handleBlur = useCallback(() => setIsPaused(false), []);

  return (
    <section className="w-full bg-white py-12 dark:bg-zinc-950 font-sans border-t border-zinc-150 dark:border-zinc-800/80 mb-12 md:mb-16">
      
      {/* 1. Centered Header Block with generous spacing and distinct typography */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 flex flex-col items-center text-center select-none">
        
        {/* Blue tag */}
        <span className="text-[11px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
          Learn how to get a discount
        </span>
        
        {/* Premium Font Heading with larger line-height (leading) and gap */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white font-heading mt-2.5 mb-3 leading-[1.15]">
          Most Popular Products
        </h2>
        
        {/* Subtitle */}
        <p className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-medium max-w-md">
          Proponents of content strategy may shun of dummy copy designers
        </p>
      </div>

      {/* 2. Carousel cards container */}
      <div className="mx-auto max-w-7xl px-8 sm:px-12 relative">
        <div 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocusCapture={handleFocus}
          onBlurCapture={handleBlur}
          className="relative"
        >
          <Carousel
            setApi={setApi}
            opts={{
              loop: true,
              align: "start",
              slidesToScroll: 1,
            }}
            className="w-full"
          >
            {/* 
              Outer wrapper is pointer-events-none to let drag gestures bubble down.
              Inner items reset pointer events to let buttons be clicked.
            */}
            <CarouselContent className="-ml-4 pointer-events-none">
              {popularProducts.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="pl-4 basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 select-none pointer-events-auto"
                >
                  <ProductCard product={product} variant="transparent" />
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Minimalist Thin Chevrons matching the screenshot (no border/shadow) */}
            <CarouselPrevious 
              className="absolute -left-6 sm:-left-10 lg:-left-12 top-1/2 -translate-y-1/2 border-0 bg-transparent hover:bg-transparent shadow-none text-zinc-300 hover:text-zinc-700 dark:text-zinc-700 dark:hover:text-zinc-300 transition-colors [&_svg]:size-6 sm:[&_svg]:size-8 pointer-events-auto" 
            />
            <CarouselNext 
              className="absolute -right-6 sm:-right-10 lg:-right-12 top-1/2 -translate-y-1/2 border-0 bg-transparent hover:bg-transparent shadow-none text-zinc-300 hover:text-zinc-700 dark:text-zinc-700 dark:hover:text-zinc-300 transition-colors [&_svg]:size-6 sm:[&_svg]:size-8 pointer-events-auto" 
            />
          </Carousel>
        </div>

        {/* 3. Centered Pagination Indicator Dots */}
        {scrollSnaps.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSnap === index
                    ? "bg-zinc-800 dark:bg-white scale-110"
                    : "bg-zinc-200 border border-zinc-300/40 dark:bg-zinc-800 dark:border-zinc-700"
                }`}
                aria-label={`Go to slide page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
