import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  readHomepageAnnouncement,
  readHomepageHeroCarousel,
  readHomepageCategoryCircles,
  readHomepageBentoGallery,
  readHomepageMerchandisingBanners,
  readSiteFooter,
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

export const HOMEPAGE_CATEGORY_CIRCLES_CACHE_TAG = "homepage-category-circles";

export async function getHomepageCategoryCircles() {
  "use cache";
  cacheLife("hours");
  cacheTag(HOMEPAGE_CACHE_TAG, HOMEPAGE_CATEGORY_CIRCLES_CACHE_TAG);

  return readHomepageCategoryCircles();
}

export const HOMEPAGE_BENTO_GALLERY_CACHE_TAG = "homepage-bento-gallery";

export async function getHomepageBentoGallery() {
  "use cache";
  cacheLife("hours");
  cacheTag(HOMEPAGE_CACHE_TAG, HOMEPAGE_BENTO_GALLERY_CACHE_TAG);

  return readHomepageBentoGallery();
}

export const HOMEPAGE_MERCHANDISING_BANNERS_CACHE_TAG =
  "homepage-merchandising-banners";

export async function getHomepageMerchandisingBanners() {
  "use cache";
  cacheLife("hours");
  cacheTag(HOMEPAGE_CACHE_TAG, HOMEPAGE_MERCHANDISING_BANNERS_CACHE_TAG);

  return readHomepageMerchandisingBanners();
}

export const SITE_FOOTER_CACHE_TAG = "site-footer";

export async function getSiteFooter() {
  "use cache";
  cacheLife("hours");
  cacheTag(HOMEPAGE_CACHE_TAG, SITE_FOOTER_CACHE_TAG);

  return readSiteFooter();
}
