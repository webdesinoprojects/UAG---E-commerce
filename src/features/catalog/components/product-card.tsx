"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  slug: string;
}

interface ProductCardProps {
  product: Product;
  variant?: "default" | "transparent";
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  // Format prices to INR format
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className={cn(
      "group relative flex flex-col overflow-hidden transition-all duration-300 ease-out",
      variant === "default"
        ? "rounded-2xl border border-zinc-150 bg-white p-3 shadow-xs hover:shadow-md hover:border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800/80"
        : "rounded-2xl border-0 bg-transparent p-1.5 shadow-none"
    )}>
      
      {/* 1. Discount Percentage Badge (Top-Left) */}
      <div className="absolute top-2.5 left-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 font-sans text-[9px] font-black text-white shadow-md shadow-orange-600/10">
        -{product.discount}%
      </div>

      {/* 2. Product Image Container (Slightly wider, full bleed for transparent) */}
      <div className={cn(
        "relative w-full overflow-hidden rounded-2xl flex items-center justify-center border transition-all duration-300",
        variant === "default"
          ? "aspect-[6/5] bg-zinc-50/50 border-zinc-100 dark:bg-zinc-900/40 dark:border-zinc-850 p-3"
          : "aspect-[1.1/1] bg-zinc-100/60 border-zinc-200/40 dark:bg-zinc-900/60 dark:border-zinc-800/60 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 p-0 shadow-sm"
      )}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className={cn(
            "transition-transform duration-500 ease-out group-hover:scale-108",
            variant === "default"
              ? "object-contain p-2"
              : "object-cover rounded-2xl"
          )}
          loading="lazy"
        />
      </div>

      {/* 3. Product Info Block */}
      <div className="flex-1 flex flex-col justify-between mt-2.5 text-center">
        <div>
          {/* Product Title */}
          <Link href={`/products/${product.slug}`}>
            <h4 className="text-[10px] sm:text-xs font-bold leading-snug text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors line-clamp-2 min-h-[30px] flex items-center justify-center px-0.5">
              {product.name}
            </h4>
          </Link>

          {/* Category Tag */}
          <span className="block text-[8px] sm:text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
            {product.category}
          </span>
        </div>

        {/* Pricing Block */}
        <div className="mt-1.5 flex items-center justify-center gap-1.5">
          <span className="text-[9px] sm:text-[11px] font-medium text-zinc-400 line-through dark:text-zinc-500">
            {formatPrice(product.originalPrice)}
          </span>
          <span className="text-[11px] sm:text-xs font-black text-blue-600 dark:text-blue-400">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      {/* 4. Action Button "BUY NOW" */}
      <Button
        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded-xl py-2 h-auto mt-3 transition-all duration-200 active:scale-[0.98] border-0 shadow-sm"
        asChild
      >
        <Link href={`/products/${product.slug}`}>
          Buy Now
        </Link>
      </Button>

    </div>
  );
}
