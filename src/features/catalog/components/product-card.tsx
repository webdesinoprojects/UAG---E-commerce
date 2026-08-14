"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buyNowAction } from "@/features/cart/actions";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  slug: string;
  productUrl?: string | null;
}

interface ProductCardProps {
  product: Product;
  variant?: "default" | "transparent";
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const productHref = product.productUrl || `/products/${product.slug}`;
  const hasDiscount =
    product.discount > 0 && product.originalPrice > product.price;

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
      "group relative flex h-full flex-col overflow-hidden transition-all duration-300 ease-out cursor-pointer",
      variant === "default"
        ? "rounded-lg border-0 bg-white p-0 shadow-none"
        : "rounded-lg border-0 bg-transparent p-0 shadow-none"
    )}>
      
      {/* 1. Discount Percentage Badge (Top-Left) */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-orange-600 font-sans text-sm font-black text-white shadow-sm sm:h-14 sm:w-14 sm:text-base">
          -{product.discount}%
        </div>
      )}

      {/* 2. Product Image Container (Slightly wider, full bleed for transparent) */}
      <Link href={productHref} className={cn(
        "relative w-full overflow-hidden rounded-lg flex items-center justify-center border-0 transition-all duration-300",
        variant === "default"
          ? "aspect-square bg-white p-0"
          : "aspect-square bg-white p-0"
      )}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className={cn(
            "transition-transform duration-500 ease-out group-hover:scale-108",
            variant === "default"
              ? "object-contain"
              : "object-contain rounded-lg"
          )}
          loading="lazy"
        />
      </Link>

      {/* 3. Product Info Block */}
      <div className="mt-3 flex flex-1 flex-col justify-between text-center">
        <div>
          {/* Product Title */}
          <Link href={productHref}>
            <h4 className="flex min-h-[4.5rem] items-start justify-center px-1 font-sans text-sm font-medium leading-snug text-zinc-800 transition-colors line-clamp-3 group-hover:text-primary sm:min-h-[4.75rem] sm:text-base">
              {product.name}
            </h4>
          </Link>

          {/* Category Tag */}
          <span className="mt-2 block text-xs font-normal text-zinc-400 sm:text-sm">
            {product.category}
          </span>
        </div>

        {/* Pricing Block */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {hasDiscount && (
            <span className="text-xs font-normal text-zinc-400 line-through sm:text-sm">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className="text-sm font-bold text-blue-600 sm:text-base">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      {/* 4. Action Button "BUY NOW" */}
      <form action={buyNowAction} className="mt-5">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="quantity" value="1" />
        <Button
          type="submit"
          className="h-12 w-full rounded-md border-0 bg-orange-600 py-2 text-sm font-black tracking-wide text-white uppercase shadow-none transition-all duration-200 hover:bg-orange-500 active:scale-[0.98]"
        >
          Buy Now
        </Button>
      </form>

    </div>
  );
}
