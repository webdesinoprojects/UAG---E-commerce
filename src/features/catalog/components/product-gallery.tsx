"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaItem } from "../types";

interface ProductGalleryProps {
  media: MediaItem[];
}

export function ProductGallery({ media }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = media[activeIndex];

  if (!media || media.length === 0) return null;

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails Sidebar */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-24 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {media.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative w-20 h-20 md:w-full md:h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                isActive ? "border-zinc-900 dark:border-white" : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
              )}
            >
              <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900">
                {item.type === "image" ? (
                  <Image 
                    src={item.src} 
                    alt="Thumbnail" 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/80 text-white">
                    <Play className="w-6 h-6" fill="currentColor" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Display Area */}
      <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden relative aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center">
        {activeMedia.type === "image" ? (
          <Image 
            src={activeMedia.src} 
            alt="Product view" 
            fill 
            className="object-contain p-4 md:p-8" 
            priority
          />
        ) : (
          <video 
            src={activeMedia.src} 
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        )}
      </div>
    </div>
  );
}
