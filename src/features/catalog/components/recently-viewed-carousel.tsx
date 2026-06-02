"use client";

import React, { useEffect, useState } from "react";
import ProductCard, { Product } from "./product-card";

interface RecentlyViewedCarouselProps {
  allProducts: Product[];
  currentProductSlug: string;
}

export function RecentlyViewedCarousel({ allProducts, currentProductSlug }: RecentlyViewedCarouselProps) {
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentlyViewed");
      if (stored) {
        const slugs: string[] = JSON.parse(stored);
        
        // Filter out the current product from the recently viewed list so we don't show the one they are already looking at
        const otherSlugs = slugs.filter(s => s !== currentProductSlug);
        
        // Map slugs to actual product objects
        const products = otherSlugs
          .map(slug => allProducts.find(p => p.slug === slug))
          .filter(Boolean) as Product[];

        setViewedProducts(products);
      }
    } catch (e) {
      console.error("Failed to load recently viewed products", e);
    }
  }, [allProducts, currentProductSlug]);

  if (viewedProducts.length === 0) return null;

  // Duplicate items slightly if there are too few to create a seamless infinite scroll effect, 
  // but only if we have at least 3 items to make it look somewhat natural
  const displayProducts = viewedProducts.length >= 3 && viewedProducts.length < 8 
    ? [...viewedProducts, ...viewedProducts, ...viewedProducts] 
    : viewedProducts;

  return (
    <section className="mt-16 lg:mt-24 border-t border-zinc-200 dark:border-zinc-800 pt-12 pb-12 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-100">
          Recently Viewed Products
        </h2>
      </div>

      {/* Auto-scrolling Marquee Container */}
      <div className="relative flex overflow-x-hidden group">
        <div className="flex gap-4 px-4 sm:px-6 lg:px-8 animate-marquee group-hover:pause">
          {displayProducts.map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="w-64 md:w-72 lg:w-[300px] shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {displayProducts.map((product, idx) => (
            <div key={`dup-${product.id}-${idx}`} className="w-64 md:w-72 lg:w-[300px] shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Tailwind config requires adding animation keyframes in tailwind.config.ts for 'animate-marquee', 
          we will inject a custom style here to ensure it works immediately without config changes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
          width: max-content;
        }
        .pause {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
}
