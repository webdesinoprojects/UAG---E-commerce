import React from "react";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse">
        
        {/* Breadcrumbs Skeleton */}
        <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded mb-8"></div>

        {/* Main PDP Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          {/* Left: Gallery Skeleton */}
          <div className="w-full flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-3 w-full md:w-24 shrink-0">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-20 h-20 md:w-full md:h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl shrink-0"></div>
              ))}
            </div>
            <div className="flex-1 aspect-square md:aspect-auto md:h-[600px] bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
          </div>

          {/* Right: Info Skeleton */}
          <div className="w-full flex flex-col gap-6">
            <div>
              <div className="h-10 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
              <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
            <div className="h-12 w-48 bg-zinc-200 dark:bg-zinc-800 rounded pb-6 border-b border-zinc-100 dark:border-zinc-800"></div>
            <div className="h-24 w-full bg-zinc-200 dark:bg-zinc-800 rounded mt-4"></div>
            <div className="h-14 w-full bg-zinc-200 dark:bg-zinc-800 rounded mt-2"></div>
          </div>

        </div>
      </div>
    </div>
  );
}
