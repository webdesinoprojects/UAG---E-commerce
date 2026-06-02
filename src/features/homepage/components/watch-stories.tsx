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
      


      {/* Centered Page-width Matte Black Container */}
      <div className="mx-auto max-w-7xl bg-[#000000] py-16 sm:py-20 overflow-hidden border border-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-4 sm:px-6 lg:px-8 min-h-[90vh] sm:min-h-0 flex flex-col justify-center">
        
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
        <div className="relative w-full overflow-hidden py-4 sm:py-6 rounded-2xl">
          {/* Subtle fade masks on the left and right sides to give it a cinematic matte framing */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#000000] to-transparent z-35 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#000000] to-transparent z-35 pointer-events-none" />

          {/* Continuous scrolling container */}
          {/* Pause animation on hover for desktop */}
          <div className="animate-marquee-infinite gap-4 sm:gap-6 flex items-center md:hover:[animation-play-state:paused]">
            {duplicateStories.map((story, i) => (
              <div
                key={`${story.id}-${i}`}
                className="group relative w-[75vw] sm:w-[190px] md:w-[210px] rounded-3xl overflow-hidden bg-[#0a0a0a] border border-zinc-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.8)] shrink-0 flex flex-col md:transition-all md:duration-500 md:ease-out md:hover:scale-[1.03] md:hover:-translate-y-2 md:hover:shadow-[0_20px_40px_rgb(245,158,11,0.15)] md:hover:border-amber-500/30 md:cursor-pointer md:hover:z-40"
              >
                {/* Video container */}
                <div className="relative w-full aspect-[9/16]">
                  <video
                    src={`/videos/${story.file}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                  {/* Subtle top gradient for cinematic look */}
                  <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/50 to-transparent z-10 pointer-events-none" />
                  
                  {/* Play icon overlay on hover */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-amber-500/90 flex items-center justify-center pl-1 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                      <svg className="w-5 h-5 text-zinc-950" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Bottom details box */}
                <div className="p-5 sm:p-4 flex flex-col justify-center z-30 transition-colors duration-300 md:group-hover:bg-[#111111]">
                  <span className="text-[11px] sm:text-[10px] font-black tracking-widest text-amber-500/80 mb-1 sm:mb-0.5 md:group-hover:text-amber-400 transition-colors">
                    {story.index}
                  </span>
                  <span className="text-sm sm:text-xs font-black font-sans text-white uppercase tracking-wider leading-none">
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
