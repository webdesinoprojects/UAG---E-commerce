"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Category } from "../types";

interface CategoryHeroProps {
  category: Category;
}

export function CategoryHero({ category }: CategoryHeroProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const items = [
    { id: 1, type: 'image', src: '/images/products/drone.png' },
    { id: 2, type: 'image', src: '/images/products/drone.png' },
    { id: 3, type: 'image', src: '/images/products/drone.png' },
    { id: 4, type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 5, type: 'image', src: '/images/products/drone.png' },
    { id: 6, type: 'image', src: '/images/products/drone.png' },
  ];

  // Handle manual scroll to update active dot
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== activeSlide && newIndex >= 0 && newIndex < items.length) {
        setActiveSlide(newIndex);
      }
    }
  };

  // Allow clicking dots to navigate
  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
      setActiveSlide(index);
    }
  };

  // Auto-advance the carousel every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we are at the end, smoothly scroll back to start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mt-6">
      {/* Component is rounded, images fill it (w-full) */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] bg-zinc-950 rounded-[2rem] overflow-hidden group shadow-lg">
        
        {/* Title Overlay */}
        <div className="absolute z-20 inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight font-sans drop-shadow-2xl px-4 text-center">
            {category.name}
          </h1>
        </div>

        {/* Subtle Gradient Overlay for Text Readability */}
        <div className="absolute z-10 inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40 pointer-events-none"></div>

        {/* Carousel Pagination Dots (Bottom Center) */}
        <div className="absolute z-20 bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-black/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                activeSlide === index 
                  ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-white" 
                  : "w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scrollable Carousel Container */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {items.map((item) => (
            <div key={item.id} className="w-full h-full flex-shrink-0 snap-center relative">
              {item.type === 'image' ? (
                <div className="w-full h-full bg-zinc-900 relative">
                  <Image 
                    src={item.src} 
                    alt={`Hero slide ${item.id}`}
                    fill
                    className="object-cover opacity-70 transition-transform duration-700 ease-out group-hover:scale-105" 
                    priority={item.id === 1}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-black relative">
                  <video 
                    src={item.src} 
                    className="w-full h-full object-cover opacity-70"
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
