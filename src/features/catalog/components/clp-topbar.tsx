"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, Menu, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { ClpSidebar } from "./clp-sidebar";
import { FilterOptions } from "../types";
import { Product } from "./product-card";

interface ClpTopbarProps {
  categoryName: string;
  totalProducts: number;
  currentPage: number;
  filterOptions?: FilterOptions;
  topRatedProducts?: Product[];
}

export function ClpTopbar({ categoryName, totalProducts, currentPage, filterOptions, topRatedProducts }: ClpTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const currentSort = searchParams.get("sort") || "default";
  const currentLayout = searchParams.get("layout") || "3"; // default 3 cols

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key === "sort") params.set("page", "1"); // reset page on sort change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const ITEMS_PER_PAGE = 12;
  const startItem = totalProducts === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalProducts);
  const showingText = totalProducts === 0 
    ? "Showing 0 results" 
    : `Showing ${startItem}–${endItem} of ${totalProducts} results`;

  return (
    <div className="flex flex-col mb-6 font-sans">
      
      {/* DESKTOP LAYOUT (Hidden on mobile) */}
      <div className="hidden md:flex gap-4 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
        
        {/* Left: Breadcrumbs */}
        <div className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</a>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">{categoryName}</span>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          
          {/* Result Count Info */}
          <div className="text-[10px] sm:text-xs font-bold text-zinc-500">
            {showingText}
          </div>

          {/* Layout Toggles */}
          <div className="flex items-center gap-1.5 border-x border-zinc-200 dark:border-zinc-800 px-4 sm:px-6">
            <button 
              onClick={() => updateParam("layout", "2")}
              className={cn("p-1.5 rounded transition-colors", currentLayout === "2" ? "text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300")}
              aria-label="2 Columns"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="18" rx="1" />
                <rect x="14" y="3" width="7" height="18" rx="1" />
              </svg>
            </button>
            <button 
              onClick={() => updateParam("layout", "3")}
              className={cn("p-1.5 rounded transition-colors", currentLayout === "3" ? "text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300")}
              aria-label="3 Columns"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="4" height="18" rx="1" />
                <rect x="10" y="3" width="4" height="18" rx="1" />
                <rect x="17" y="3" width="4" height="18" rx="1" />
              </svg>
            </button>
            <button 
              onClick={() => updateParam("layout", "4")}
              className={cn("p-1.5 rounded transition-colors", currentLayout === "4" ? "text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300")}
              aria-label="4 Columns"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="3" height="18" rx="0.5" />
                <rect x="8.33" y="3" width="3" height="18" rx="0.5" />
                <rect x="13.66" y="3" width="3" height="18" rx="0.5" />
                <rect x="19" y="3" width="3" height="18" rx="0.5" />
              </svg>
            </button>
          </div>

          {/* Sorting Dropdown */}
          <div className="relative">
            <select 
              value={currentSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="appearance-none bg-transparent text-[10px] sm:text-xs font-bold text-zinc-900 dark:text-zinc-100 pr-8 py-1 focus:outline-none cursor-pointer"
            >
              <option value="default">Default sorting</option>
              <option value="popularity">Sort by popularity</option>
              <option value="rating">Sort by average rating</option>
              <option value="latest">Sort by latest</option>
              <option value="price-asc">Sort by price: low to high</option>
              <option value="price-desc">Sort by price: high to low</option>
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT (Hidden on desktop) */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Top Info */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</a>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">{categoryName}</span>
          </div>
          <div className="text-sm text-zinc-500 font-medium">
            {showingText}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800 my-2" />

        {/* Action Bar */}
        <div className="flex items-center justify-between pb-2">
          
          {/* Filter Sheet Trigger */}
          <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2.5 text-zinc-900 dark:text-zinc-100 font-bold text-sm hover:text-primary transition-colors">
                <Menu className="w-5 h-5" />
                Show sidebar
              </button>
            </SheetTrigger>
            
            <SheetContent side="left" className="w-[85vw] max-w-[350px] p-0 bg-white dark:bg-[#050505] border-r-zinc-200 dark:border-zinc-800">
              <SheetHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800 text-left">
                <SheetTitle className="text-lg font-black uppercase tracking-wider">Filters</SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100vh-65px)] overflow-y-auto p-5 pb-20">
                {filterOptions && topRatedProducts ? (
                  <ClpSidebar
                    filterOptions={filterOptions}
                    topRatedProducts={topRatedProducts}
                    mode="sheet"
                  />
                ) : null}
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort Icon / Dropdown */}
          <div className="relative">
            <select 
              value={currentSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Sort products"
            >
              <option value="default">Default sorting</option>
              <option value="popularity">Sort by popularity</option>
              <option value="rating">Sort by average rating</option>
              <option value="latest">Sort by latest</option>
              <option value="price-asc">Sort by price: low to high</option>
              <option value="price-desc">Sort by price: high to low</option>
            </select>
            <button className="text-zinc-900 dark:text-zinc-100 pointer-events-none p-1">
              <ArrowUpDown className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
