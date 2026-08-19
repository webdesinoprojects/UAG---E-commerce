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

export default function MostPopular({ products }: { products: Product[] }) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [currentSnap, setCurrentSnap] = useState(0);

  useEffect(() => {
    const handleVisibility = () => setIsTabHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReducedMotion(mediaQuery.matches);
    const motionListener = (event: MediaQueryListEvent) => setIsReducedMotion(event.matches);
    mediaQuery.addEventListener("change", motionListener);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      mediaQuery.removeEventListener("change", motionListener);
    };
  }, []);

  useEffect(() => {
    if (!api) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScrollSnaps(api.scrollSnapList());
    setCurrentSnap(api.selectedScrollSnap());

    const onSelect = () => setCurrentSnap(api.selectedScrollSnap());
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
    <section className="mb-8 w-full border-t border-zinc-150 bg-white pt-8 pb-10 font-sans dark:border-zinc-800/80 dark:bg-zinc-950 md:mb-10">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col items-center px-4 text-center select-none sm:px-6 lg:px-8">
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          Learn how to get a discount
        </span>
        <h2 className="mt-3 text-3xl font-medium tracking-wide text-zinc-900 dark:text-white sm:text-4xl">
          Most Popular Products
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 font-medium text-zinc-400 dark:text-zinc-500 sm:text-base">
          Proponents of content strategy may shun of dummy copy designers
        </p>
      </div>

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
            opts={{ loop: true, align: "start", slidesToScroll: 1 }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 pointer-events-none">
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="flex pl-4 basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 select-none pointer-events-auto"
                >
                  <ProductCard product={product} variant="transparent" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-6 sm:-left-10 lg:-left-12 top-1/2 -translate-y-1/2 border-0 bg-transparent hover:bg-transparent shadow-none text-zinc-300 hover:text-zinc-700 dark:text-zinc-700 dark:hover:text-zinc-300 transition-colors [&_svg]:size-6 sm:[&_svg]:size-8 pointer-events-auto" />
            <CarouselNext className="absolute -right-6 sm:-right-10 lg:-right-12 top-1/2 -translate-y-1/2 border-0 bg-transparent hover:bg-transparent shadow-none text-zinc-300 hover:text-zinc-700 dark:text-zinc-700 dark:hover:text-zinc-300 transition-colors [&_svg]:size-6 sm:[&_svg]:size-8 pointer-events-auto" />
          </Carousel>
        </div>

        {scrollSnaps.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 cursor-pointer ${currentSnap === index ? "bg-zinc-800 dark:bg-white scale-110" : "bg-zinc-200 border border-zinc-300/40 dark:bg-zinc-800 dark:border-zinc-700"}`}
                aria-label={`Go to slide page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
