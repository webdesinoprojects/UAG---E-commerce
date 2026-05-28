"use client";

import React from "react";

const stories = [
  { id: "s1", index: "01", title: "Airdopes 2", file: "story1.mp4" },
  { id: "s2", index: "02", title: "GM8 Pro", file: "story2.mp4" },
  { id: "s3", index: "03", title: "Master Buds 2", file: "story3.mp4" },
  { id: "s4", index: "04", title: "Latest Shoot", file: "story4.mp4" },
  { id: "s5", index: "05", title: "AeroStrike HD", file: "story5.mp4" },
  { id: "s6", index: "06", title: "Vital Watch", file: "story6.mp4" },
  { id: "s7", index: "07", title: "Soundstage", file: "story7.mp4" },
  { id: "s8", index: "08", title: "Solar Core", file: "story8.mp4" },
  { id: "s9", index: "09", title: "Armour Speed", file: "story9.mp4" },
  { id: "s10", index: "10", title: "Pro ANC Buds", file: "story10.mp4" }
];

export default function WatchStories() {
  // We duplicate the list to ensure a seamless looping effect in the marquee
  const duplicateStories = [...stories, ...stories];

  return (
    <section className="w-full py-4 select-none mb-12 md:mb-20 px-4 sm:px-6 lg:px-8">
      


      {/* Centered Page-width Fully Rounded Matte Black Container */}
      <div className="mx-auto max-w-7xl bg-[#000000] py-16 sm:py-20 rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-4 sm:px-6 lg:px-8">
        
        {/* Header Block with Elegant Typography & Animations */}
        <div className="flex flex-col items-center text-center mb-12 px-4 animate-header-reveal">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-amber-500/80 mb-2.5">
            OUR WORK
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans text-white tracking-tight leading-tight">
            Watch Our <span className="elegant-serif italic text-amber-500 font-medium tracking-wide">Stories</span>
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mt-4" />
        </div>

        {/* Video Cards Infinite Carousel Marquee */}
        {/* pointer-events-none blocks user manual drag/swipe gestures completely, maintaining CSS speed */}
        <div className="relative w-full overflow-hidden pointer-events-none py-2 rounded-2xl">
          {/* Subtle fade masks on the left and right sides to give it a cinematic matte framing */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#000000] to-transparent z-35" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#000000] to-transparent z-35" />

          {/* Continuous scrolling container */}
          <div className="animate-marquee-infinite gap-4 sm:gap-6">
            {duplicateStories.map((story, i) => (
              <div
                key={`${story.id}-${i}`}
                className="relative w-[150px] sm:w-[190px] md:w-[210px] aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.8)] shrink-0 flex flex-col justify-between"
              >
                {/* Autoplay, loop, muted, playsinline tech loop player */}
                <video
                  src={`/videos/${story.file}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0 rounded-3xl"
                />

                {/* Heavy bottom gradient overlay to blend video with details */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/85 to-transparent z-10" />

                {/* Bottom details Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 z-20 flex flex-col justify-end pointer-events-none">
                  <span className="text-[10px] font-black tracking-widest text-amber-500/80 mb-0.5">
                    {story.index}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black font-sans text-white uppercase tracking-wider leading-none">
                    {story.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
