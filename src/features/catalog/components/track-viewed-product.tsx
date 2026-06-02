"use client";

import { useEffect } from "react";

export function TrackViewedProduct({ productSlug }: { productSlug: string }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentlyViewed");
      let viewed: string[] = stored ? JSON.parse(stored) : [];
      
      // Remove if it already exists to move it to the front
      viewed = viewed.filter(slug => slug !== productSlug);
      
      // Add to front
      viewed.unshift(productSlug);
      
      // Keep only last 10
      if (viewed.length > 10) {
        viewed = viewed.slice(0, 10);
      }
      
      localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
    } catch (error) {
      console.error("Failed to update recently viewed products", error);
    }
  }, [productSlug]);

  return null;
}
