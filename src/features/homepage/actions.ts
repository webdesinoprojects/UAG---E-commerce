"use server";

import "server-only";

import { revalidatePath, updateTag } from "next/cache";
import {
  HOMEPAGE_CACHE_TAG,
  HOMEPAGE_HERO_CAROUSEL_CACHE_TAG,
  HOMEPAGE_TOP_MARQUEE_CACHE_TAG,
  HOMEPAGE_CATEGORY_CIRCLES_CACHE_TAG,
} from "@/features/homepage/queries";
import { requireAdmin } from "@/server/auth/admin";
import {
  writeHomepageAnnouncement,
  writeHomepageHeroCarousel,
  writeHomepageCategoryCircles,
} from "@/server/repositories/homepage-repository";
import {
  parseHomepageAnnouncementForm,
  parseHomepageHeroCarouselForm,
  parseHomepageCategoryCirclesForm,
} from "@/server/validators/homepage";

export interface HomepageAnnouncementActionState {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function updateHomepageAnnouncementAction(
  _previousState: HomepageAnnouncementActionState,
  formData: FormData
): Promise<HomepageAnnouncementActionState> {
  const admin = await requireAdmin();
  const parsed = parseHomepageAnnouncementForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await writeHomepageAnnouncement(parsed.data, admin.id);
    updateTag(HOMEPAGE_TOP_MARQUEE_CACHE_TAG);
    updateTag(HOMEPAGE_CACHE_TAG);
    revalidatePath("/admin/homepage/top-banner");

    return {
      status: "success",
      message: "Top marquee banner published.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not publish the banner. Try again.",
    };
  }
}

export async function updateHomepageHeroCarouselAction(
  _previousState: HomepageAnnouncementActionState,
  formData: FormData
): Promise<HomepageAnnouncementActionState> {
  const admin = await requireAdmin();
  const parsed = parseHomepageHeroCarouselForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await writeHomepageHeroCarousel(parsed.data, admin.id);
    updateTag(HOMEPAGE_HERO_CAROUSEL_CACHE_TAG);
    updateTag(HOMEPAGE_CACHE_TAG);
    revalidatePath("/admin/homepage/hero-carousel");

    return {
      status: "success",
      message: "Hero carousel published.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not publish the hero carousel. Try again.",
    };
  }
}

export async function updateHomepageCategoryCirclesAction(
  _previousState: HomepageAnnouncementActionState,
  formData: FormData
): Promise<HomepageAnnouncementActionState> {
  const admin = await requireAdmin();
  const parsed = parseHomepageCategoryCirclesForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await writeHomepageCategoryCircles(parsed.data, admin.id);
    updateTag(HOMEPAGE_CATEGORY_CIRCLES_CACHE_TAG);
    updateTag(HOMEPAGE_CACHE_TAG);
    revalidatePath("/admin/homepage/categories");

    return {
      status: "success",
      message: "Category circles published.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not publish the category circles. Try again.",
    };
  }
}
