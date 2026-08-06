"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { HomepageCategoryCircles } from "@/features/homepage/types";

function getOriginalImageKitVideoUrl(url: string) {
  return url.replace(
    /^(https:\/\/ik\.imagekit\.io\/[^/]+\/)(?!tr:orig-true\/)/,
    "$1tr:orig-true/"
  );
}

function CategoryVideo({ src }: { src: string }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let frameRequest = 0;

    const keepLoopSeamless: VideoFrameRequestCallback = () => {
      if (
        Number.isFinite(video.duration) &&
        video.duration > 0 &&
        video.duration - video.currentTime <= 0.08
      ) {
        video.currentTime = 0;
        void video.play();
      }
      frameRequest = video.requestVideoFrameCallback(keepLoopSeamless);
    };

    if (isVisible) {
      video.load();
      void video.play();
      if ("requestVideoFrameCallback" in video) {
        frameRequest = video.requestVideoFrameCallback(keepLoopSeamless);
      }
    } else {
      video.pause();
    }

    return () => {
      if (frameRequest) video.cancelVideoFrameCallback(frameRequest);
    };
  }, [isVisible]);

  return (
    <video
      ref={videoRef}
      src={isVisible ? getOriginalImageKitVideoUrl(src) : undefined}
      autoPlay
      muted
      loop
      playsInline
      preload={isVisible ? "auto" : "none"}
      disablePictureInPicture
      onCanPlay={(event) => void event.currentTarget.play()}
      onEnded={(event) => {
        event.currentTarget.currentTime = 0;
        void event.currentTarget.play();
      }}
      className="absolute inset-0 h-full w-full rounded-xl object-cover [transform:translateZ(0)]"
    />
  );
}

export default function CategoryCircles({
  categoryCircles,
}: {
  categoryCircles: HomepageCategoryCircles;
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let animationFrame = 0;
    let previousTime = performance.now();
    let pausedUntil = 0;

    const scroll = (time: number) => {
      const elapsed = Math.min(time - previousTime, 50);
      previousTime = time;

      if (time >= pausedUntil && scroller.scrollWidth > scroller.clientWidth) {
        const end = scroller.scrollWidth - scroller.clientWidth;
        if (scroller.scrollLeft >= end - 1) {
          scroller.scrollLeft = 0;
          pausedUntil = time + 900;
        } else {
          scroller.scrollLeft += elapsed * 0.035;
        }
      }

      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  if (!categoryCircles.isEnabled || categoryCircles.items.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-background py-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Scrollable Container */}
        <div
          ref={scrollerRef}
          className="flex flex-nowrap gap-4 overflow-x-auto pb-4 scrollbar-none md:gap-6 md:pb-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categoryCircles.items.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group flex w-[140px] shrink-0 snap-start flex-col items-center text-center md:w-[180px] lg:w-[calc((100%-6rem)/5)]"
            >
              {/* Card Container */}
              <Card className="relative overflow-hidden aspect-square w-full rounded-2xl md:rounded-[2rem] border border-zinc-100 bg-white p-3 shadow-xs transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-md group-hover:bg-white group-hover:border-primary/20 dark:border-zinc-800/40">
                <div className="relative h-full w-full flex items-center justify-center">
                  {category.hoverMediaUrl && category.hoverMediaMimeType?.startsWith("video/") ? (
                    <CategoryVideo src={category.hoverMediaUrl} />
                  ) : category.hoverMediaUrl && category.hoverMediaMimeType === "image/gif" ? (
                    <Image
                      src={category.hoverMediaUrl}
                      alt={category.imageAlt}
                      fill
                      unoptimized
                      className="rounded-xl object-cover"
                    />
                  ) : null}
                </div>
              </Card>

              {/* Text Information */}
              <div className="mt-3 flex flex-col items-center">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors">
                  {category.name}
                </span>
                <span className="mt-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  {category.productCount} {category.productCount === 1 ? "Product" : "Products"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
