import "server-only";

import { createSupabaseAnonServerClient } from "@/server/db/supabase";
import { createSupabaseServiceRoleClient } from "@/server/db/supabase";
import {
  fallbackHomepageAnnouncement,
  fallbackHomepageHeroCarousel,
  type HomepageAnnouncementInput,
  type HomepageHeroCarouselInput,
  toHomepageAnnouncement,
  toHomepageHeroCarousel,
} from "@/server/validators/homepage";
import type {
  HomepageAnnouncement,
  HomepageHeroCarousel,
} from "@/features/homepage/types";

const TOP_MARQUEE_SECTION_KEY = "homepage.top_marquee";
const HERO_CAROUSEL_SECTION_KEY = "homepage.hero_carousel";
const HERO_ITEM_COLUMNS =
  "id,item_key,title,subtitle,body,href,settings,sort_order,is_enabled";

export async function readHomepageAnnouncement(): Promise<HomepageAnnouncement> {
  const supabase = createSupabaseAnonServerClient();

  if (!supabase) {
    return fallbackHomepageAnnouncement;
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", TOP_MARQUEE_SECTION_KEY)
      .maybeSingle();

    // Missing section or a query error means the backend is not ready/unavailable
    // (e.g. migration not pushed) -> use safe fallback content.
    if (sectionError || !section) {
      return fallbackHomepageAnnouncement;
    }

    // Section exists but the admin turned it off -> hide it. No item fetch and
    // no fallback content; an empty DTO makes the storefront render nothing.
    if (!section.is_enabled) {
      return toHomepageAnnouncement(section, []);
    }

    const { data: items, error: itemsError } = await supabase
      .from("cms_section_items")
      .select("id,item_key,title,href,settings,sort_order,is_enabled")
      .eq("section_id", section.id)
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });

    if (itemsError) {
      return fallbackHomepageAnnouncement;
    }

    return toHomepageAnnouncement(section, items ?? []);
  } catch {
    return fallbackHomepageAnnouncement;
  }
}

export async function readAdminHomepageAnnouncement(): Promise<HomepageAnnouncement> {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    return fallbackHomepageAnnouncement;
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", TOP_MARQUEE_SECTION_KEY)
      .maybeSingle();

    if (sectionError || !section) {
      return fallbackHomepageAnnouncement;
    }

    const { data: items, error: itemsError } = await supabase
      .from("cms_section_items")
      .select("id,item_key,title,href,settings,sort_order,is_enabled")
      .eq("section_id", section.id)
      .order("sort_order", { ascending: true });

    if (itemsError) {
      return fallbackHomepageAnnouncement;
    }

    return toHomepageAnnouncement(section, items ?? []);
  } catch {
    return fallbackHomepageAnnouncement;
  }
}

export async function writeHomepageAnnouncement(
  input: HomepageAnnouncementInput,
  adminId: string
) {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    throw new Error("Supabase service client is not configured.");
  }

  const { data: section, error: sectionError } = await supabase
    .from("cms_sections")
    .upsert(
      {
        section_key: TOP_MARQUEE_SECTION_KEY,
        section_type: "announcement_marquee",
        name: "Homepage Top Marquee",
        is_enabled: input.isEnabled,
        settings: {
          backgroundColor: input.backgroundColor,
          textColor: input.textColor,
          accentColor: input.accentColor,
          speedSeconds: input.speedSeconds,
        },
        updated_by: adminId,
      },
      { onConflict: "section_key" }
    )
    .select("id")
    .single();

  if (sectionError || !section) {
    throw new Error("Failed to save marquee section.");
  }

  const { error: deleteError } = await supabase
    .from("cms_section_items")
    .delete()
    .eq("section_id", section.id);

  if (deleteError) {
    throw new Error("Failed to replace marquee messages.");
  }

  const rows = input.messages.map((message, index) => ({
    section_id: section.id,
    item_key: `message-${index + 1}`,
    title: message,
    settings: {
      icon: index === 0 ? "truck" : "sparkles",
    },
    sort_order: (index + 1) * 10,
    is_enabled: true,
    updated_by: adminId,
  }));

  const { error: insertError } = await supabase
    .from("cms_section_items")
    .insert(rows);

  if (insertError) {
    throw new Error("Failed to save marquee messages.");
  }
}

/* -------------------------------------------------------------------------- */
/* Homepage hero carousel                                                     */
/* -------------------------------------------------------------------------- */

// Storefront read: anon client, RLS-enforced, enabled items only.
export async function readHomepageHeroCarousel(): Promise<HomepageHeroCarousel> {
  const supabase = createSupabaseAnonServerClient();

  if (!supabase) {
    return fallbackHomepageHeroCarousel;
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", HERO_CAROUSEL_SECTION_KEY)
      .maybeSingle();

    // Missing section or a query error means the backend is not ready/unavailable
    // (e.g. migration not pushed) -> use safe fallback content.
    if (sectionError || !section) {
      return fallbackHomepageHeroCarousel;
    }

    // Section exists but the admin turned it off -> hide it. No item fetch and
    // no fallback content; an empty DTO makes the storefront render nothing.
    if (!section.is_enabled) {
      return toHomepageHeroCarousel(section, []);
    }

    const { data: items, error: itemsError } = await supabase
      .from("cms_section_items")
      .select(HERO_ITEM_COLUMNS)
      .eq("section_id", section.id)
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });

    if (itemsError) {
      return fallbackHomepageHeroCarousel;
    }

    return toHomepageHeroCarousel(section, items ?? []);
  } catch {
    return fallbackHomepageHeroCarousel;
  }
}

// Admin read: service role, bypasses RLS so disabled slides are still editable.
// The caller (page/action) must verify admin before invoking this.
export async function readAdminHomepageHeroCarousel(): Promise<HomepageHeroCarousel> {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    return fallbackHomepageHeroCarousel;
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", HERO_CAROUSEL_SECTION_KEY)
      .maybeSingle();

    if (sectionError || !section) {
      return fallbackHomepageHeroCarousel;
    }

    const { data: items, error: itemsError } = await supabase
      .from("cms_section_items")
      .select(HERO_ITEM_COLUMNS)
      .eq("section_id", section.id)
      .order("sort_order", { ascending: true });

    if (itemsError) {
      return fallbackHomepageHeroCarousel;
    }

    return toHomepageHeroCarousel(section, items ?? []);
  } catch {
    return fallbackHomepageHeroCarousel;
  }
}

// Admin write: service role. Caller must verify admin first. Replaces the slide
// set in full so removed slides do not linger.
export async function writeHomepageHeroCarousel(
  input: HomepageHeroCarouselInput,
  adminId: string
) {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    throw new Error("Supabase service client is not configured.");
  }

  const { data: section, error: sectionError } = await supabase
    .from("cms_sections")
    .upsert(
      {
        section_key: HERO_CAROUSEL_SECTION_KEY,
        section_type: "hero_carousel",
        name: "Homepage Hero Carousel",
        is_enabled: input.isEnabled,
        settings: {
          autoplaySeconds: input.autoplaySeconds,
        },
        updated_by: adminId,
      },
      { onConflict: "section_key" }
    )
    .select("id")
    .single();

  if (sectionError || !section) {
    throw new Error("Failed to save hero carousel section.");
  }

  const { error: deleteError } = await supabase
    .from("cms_section_items")
    .delete()
    .eq("section_id", section.id);

  if (deleteError) {
    throw new Error("Failed to replace hero carousel slides.");
  }

  const rows = input.slides.map((slide, index) => ({
    section_id: section.id,
    item_key: `slide-${index + 1}`,
    title: slide.title,
    subtitle: slide.subtitle,
    body: slide.description,
    href: slide.primaryCtaHref,
    settings: {
      image: slide.image,
      accentColor: slide.accentColor,
      badgeText: slide.badgeText,
      primaryCtaLabel: slide.primaryCtaLabel,
      secondaryCtaLabel: slide.secondaryCtaLabel,
      secondaryCtaHref: slide.secondaryCtaHref,
      features: slide.features,
    },
    sort_order: (index + 1) * 10,
    is_enabled: slide.isEnabled,
    updated_by: adminId,
  }));

  const { error: insertError } = await supabase
    .from("cms_section_items")
    .insert(rows);

  if (insertError) {
    throw new Error("Failed to save hero carousel slides.");
  }
}
