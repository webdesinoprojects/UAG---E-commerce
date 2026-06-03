import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  readHomepageAnnouncement,
  readHomepageHeroCarousel,
} from "@/server/repositories/homepage-repository";

export const HOMEPAGE_CACHE_TAG = "homepage";
export const HOMEPAGE_TOP_MARQUEE_CACHE_TAG = "homepage-top-marquee";
export const HOMEPAGE_HERO_CAROUSEL_CACHE_TAG = "homepage-hero-carousel";

export async function getHomepageAnnouncement() {
  "use cache";
  cacheLife("hours");
  cacheTag(HOMEPAGE_CACHE_TAG, HOMEPAGE_TOP_MARQUEE_CACHE_TAG);

  return readHomepageAnnouncement();
}

export async function getHomepageHeroCarousel() {
  "use cache";
  cacheLife("hours");
  cacheTag(HOMEPAGE_CACHE_TAG, HOMEPAGE_HERO_CAROUSEL_CACHE_TAG);

  return readHomepageHeroCarousel();
}
