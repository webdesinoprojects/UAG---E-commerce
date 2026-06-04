"use server";

import "server-only";

import { revalidatePath, updateTag } from "next/cache";
import {
  HOMEPAGE_CACHE_TAG,
  HOMEPAGE_BENTO_GALLERY_CACHE_TAG,
  HOMEPAGE_HERO_CAROUSEL_CACHE_TAG,
  HOMEPAGE_MERCHANDISING_BANNERS_CACHE_TAG,
  HOMEPAGE_TOP_MARQUEE_CACHE_TAG,
  HOMEPAGE_CATEGORY_CIRCLES_CACHE_TAG,
  SITE_FOOTER_CACHE_TAG,
} from "@/features/homepage/queries";
import { requireAdmin } from "@/server/auth/admin";
import {
  writeHomepageAnnouncement,
  writeHomepageBentoGallery,
  writeHomepageHeroCarousel,
  writeHomepageMerchandisingBanners,
  writeHomepageCategoryCircles,
  writeSiteFooter,
} from "@/server/repositories/homepage-repository";
import {
  parseHomepageAnnouncementForm,
  parseHomepageBentoGalleryForm,
  parseHomepageHeroCarouselForm,
  parseHomepageMerchandisingBannersForm,
  parseHomepageCategoryCirclesForm,
  parseSiteFooterForm,
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

export async function updateHomepageBentoGalleryAction(
  _previousState: HomepageAnnouncementActionState,
  formData: FormData
): Promise<HomepageAnnouncementActionState> {
  const admin = await requireAdmin();
  const parsed = parseHomepageBentoGalleryForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await writeHomepageBentoGallery(parsed.data, admin.id);
    updateTag(HOMEPAGE_BENTO_GALLERY_CACHE_TAG);
    updateTag(HOMEPAGE_CACHE_TAG);
    revalidatePath("/admin/homepage/bento-gallery");

    return {
      status: "success",
      message: "Bento gallery published.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not publish the bento gallery. Try again.",
    };
  }
}

export async function updateHomepageMerchandisingBannersAction(
  _previousState: HomepageAnnouncementActionState,
  formData: FormData
): Promise<HomepageAnnouncementActionState> {
  const admin = await requireAdmin();
  const parsed = parseHomepageMerchandisingBannersForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await writeHomepageMerchandisingBanners(parsed.data, admin.id);
    updateTag(HOMEPAGE_MERCHANDISING_BANNERS_CACHE_TAG);
    updateTag(HOMEPAGE_CACHE_TAG);
    revalidatePath("/admin/homepage/merchandising");

    return {
      status: "success",
      message: "Merchandising banners published.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not publish the merchandising banners. Try again.",
    };
  }
}

export async function updateSiteFooterAction(
  _previousState: HomepageAnnouncementActionState,
  formData: FormData
): Promise<HomepageAnnouncementActionState> {
  const admin = await requireAdmin();
  const parsed = parseSiteFooterForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await writeSiteFooter(parsed.data, admin.id);
    updateTag(SITE_FOOTER_CACHE_TAG);
    updateTag(HOMEPAGE_CACHE_TAG);
    revalidatePath("/admin/homepage/footer");

    return {
      status: "success",
      message: "Footer settings published.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not publish the footer settings. Try again.",
    };
  }
}
