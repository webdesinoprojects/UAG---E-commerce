"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { FilterOptions } from "../types";
import { Product } from "../components/product-card";

interface ClpSidebarProps {
  filterOptions: FilterOptions;
  topRatedProducts: Product[];
  mode?: "desktop" | "sheet";
}

export function ClpSidebar({ filterOptions, topRatedProducts, mode = "desktop" }: ClpSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Price State
  const initialMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : filterOptions.priceRange.min;
  const initialMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : filterOptions.priceRange.max;
  
  const [priceRange, setPriceRange] = useState([initialMinPrice, initialMaxPrice]);

  // Handle URL updates gracefully without debouncing for this mock, but ideally debounced.
  const applyFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.keys(updates).forEach((key) => {
      if (updates[key] === null) {
        params.delete(key);
      } else {
        params.set(key, updates[key] as string);
      }
    });

    // Reset to page 1 on filter change
    params.set("page", "1");
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handlePriceCommit = (value: number[]) => {
    applyFilters({
      minPrice: value[0].toString(),
      maxPrice: value[1].toString()
    });
  };

  const handleBrandChange = (brandName: string, checked: boolean) => {
    // In a real app, this might handle multiple brands via comma separation.
    applyFilters({ brand: checked ? brandName : null });
  };

  const handleStockChange = (stockValue: string, checked: boolean) => {
    applyFilters({ stockStatus: checked ? stockValue : null });
  };

  const currentBrand = searchParams.get("brand");
  const currentStock = searchParams.get("stockStatus");

  return (
    <aside
      className={cn(
        "w-full shrink-0 font-sans h-fit",
        mode === "desktop" && "hidden md:block md:w-64 md:sticky md:top-24"
      )}
    >
      <div className="flex flex-col gap-10 md:max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* FILTER BY PRICE */}
      <div className="flex flex-col gap-5">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Filter by price
        </h3>
        <Slider
          defaultValue={[initialMinPrice, initialMaxPrice]}
          value={priceRange}
          min={filterOptions.priceRange.min}
          max={filterOptions.priceRange.max}
          step={10}
          onValueChange={handlePriceChange}
          className="py-2"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-500">
            Price: <strong className="text-zinc-900 dark:text-zinc-100">₹{priceRange[0]} — ₹{priceRange[1]}</strong>
          </span>
          <button 
            onClick={() => handlePriceCommit(priceRange)}
            className="text-[9px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1.5 rounded transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* FILTER BY BRAND */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Filter by brand
        </h3>
        <div className="flex flex-col gap-3">
          {filterOptions.brands.map((brand) => (
            <div key={brand.name} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id={`brand-${brand.name}`} 
                  checked={currentBrand === brand.name}
                  onCheckedChange={(checked) => handleBrandChange(brand.name, checked as boolean)}
                />
                <label 
                  htmlFor={`brand-${brand.name}`} 
                  className="text-xs text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {brand.name}
                </label>
              </div>
              <span className="text-[10px] text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5">
                {brand.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* STOCK STATUS */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Stock status
        </h3>
        <div className="flex flex-col gap-3">
          {filterOptions.stockStatuses.map((status) => (
            <div key={status.value} className="flex items-center gap-2 group cursor-pointer">
              <Checkbox 
                id={`stock-${status.value}`} 
                checked={currentStock === status.value}
                onCheckedChange={(checked) => handleStockChange(status.value, checked as boolean)}
              />
              <label 
                htmlFor={`stock-${status.value}`} 
                className="text-xs text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {status.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* TOP RATED PRODUCTS */}
      <div className="flex flex-col gap-5">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Top Rated Products
        </h3>
        <div className="flex flex-col gap-4">
          {topRatedProducts.map((product) => (
            <div key={product.id} className="flex gap-3 items-center group cursor-pointer">
              <div className="h-16 w-16 shrink-0 bg-zinc-50 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 rounded-lg flex items-center justify-center p-1 relative overflow-hidden">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className="object-contain p-2 group-hover:scale-110 transition-transform duration-300" 
                />
              </div>
              <div className="flex flex-col">
                <Link href={`/products/${product.slug}`} className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 line-clamp-2 leading-tight">
                  {product.name}
                </Link>
                <div className="flex gap-1.5 items-center mt-1">
                  {product.originalPrice > product.price && (
                    <span className="text-[9px] text-zinc-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                  <span className="text-[11px] font-black text-blue-600">₹{product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      </div>
    </aside>
  );
}
