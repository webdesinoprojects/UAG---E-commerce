import React from "react";
import MarqueeBanner from "@/features/homepage/components/marquee-banner";
import CategoryCircles from "@/features/homepage/components/category-circles";
import HeroCarousel from "@/features/homepage/components/hero-carousel";
import ProductCategoryGrid from "@/features/homepage/components/product-category-grid";
import Milestones from "@/features/homepage/components/milestones";
import FullscreenBanner from "@/features/homepage/components/fullscreen-banner";
import NewArrivals from "@/features/homepage/components/new-arrivals";
import MostPopular from "@/features/homepage/components/most-popular";
import BentoGrid from "@/features/homepage/components/bento-grid";
import WatchStories from "@/features/homepage/components/watch-stories";
import {
  getHomepageAnnouncement,
  getHomepageHeroCarousel,
} from "@/features/homepage/queries";

export default async function StoreHomePage() {
  const [announcement, heroCarousel] = await Promise.all([
    getHomepageAnnouncement(),
    getHomepageHeroCarousel(),
  ]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      {/* 1. Infinite Scrolling Top Ribbon Banner */}
      <MarqueeBanner announcement={announcement} />

      {/* 2. Top Category Circular Navigation */}
      <CategoryCircles />

      {/* 3. High Impact Banner Carousel */}
      <HeroCarousel heroCarousel={heroCarousel} />

      {/* 4. Secondary Detailed Product Category Grid */}
      <ProductCategoryGrid />

      {/* 5. Milestones & Statistics Banner */}
      <Milestones />

      {/* 6. Premium Fullscreen Banner Carousel */}
      <FullscreenBanner />

      {/* 7. New Arrivals Filter Grid */}
      <NewArrivals />

      {/* 8. Most Popular Product Carousel */}
      <MostPopular />

      {/* 9. Bento Grid Showcase */}
      <BentoGrid />

      {/* 10. Watch Our Stories Video Carousel */}
      <WatchStories />
    </div>
  );
}
