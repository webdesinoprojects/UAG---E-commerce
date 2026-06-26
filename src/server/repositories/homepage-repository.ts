import "server-only";

import { createSupabaseAnonServerClient } from "@/server/db/supabase";
import { createSupabaseServiceRoleClient } from "@/server/db/supabase";
import {
  fallbackHomepageAnnouncement,
  fallbackHomepageHeroCarousel,
  type HomepageAnnouncementInput,
  type HomepageHeroCarouselInput,
  type HeroCmsSectionItemRow,
  toHomepageAnnouncement,
  toHomepageHeroCarousel,
  fallbackHomepageCategoryCircles,
  toHomepageCategoryCircles,
  type CategoryCmsSectionItemRow,
  type HomepageCategoryCirclesInput,
  fallbackHomepageBentoGallery,
  toHomepageBentoGallery,
  type BentoCmsSectionItemRow,
  type HomepageBentoGalleryInput,
  fallbackHomepageMerchandisingBanners,
  toHomepageMerchandisingBanners,
  type MerchCmsSectionItemRow,
  type HomepageMerchandisingBannersInput,
  fallbackSiteFooter,
  toSiteFooter,
  type SiteFooterCmsSectionItemRow,
  type SiteFooterInput,
} from "@/server/validators/homepage";
import type {
  HomepageAnnouncement,
  HomepageHeroCarousel,
  HomepageCategoryCircles,
  HomepageBentoGallery,
  HomepageMerchandisingBanners,
  SiteFooterContent,
} from "@/features/homepage/types";

type ServerSupabaseClient = NonNullable<
  ReturnType<typeof createSupabaseAnonServerClient>
>;

// Batch-resolve media asset ids to { url, mime_type }. `publicOnly` restricts to
// RLS-public rows for unauthenticated storefront reads; admin reads pass false.
async function fetchMediaMap(
  supabase: ServerSupabaseClient,
  ids: string[],
  publicOnly: boolean
): Promise<Map<string, { url: string; mime_type: string | null }>> {
  const map = new Map<string, { url: string; mime_type: string | null }>();

  if (ids.length === 0) {
    return map;
  }

  let query = supabase
    .from("media_assets")
    .select("id, url, mime_type")
    .in("id", ids);

  if (publicOnly) {
    query = query.eq("is_public", true);
  }

  const { data } = await query;

  if (data) {
    data.forEach((asset) => map.set(asset.id, asset));
  }

  return map;
}


const TOP_MARQUEE_SECTION_KEY = "homepage.top_marquee";
const HERO_CAROUSEL_SECTION_KEY = "homepage.hero_carousel";
const HERO_ITEM_COLUMNS =
  "id,item_key,title,subtitle,body,href,settings,sort_order,is_enabled,media_asset_id";

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

    const heroItems = (items ?? []) as HeroCmsSectionItemRow[];
    const mediaIds = heroItems
      .map((item) => item.media_asset_id)
      .filter((id): id is string => Boolean(id));
    const mediaMap = await fetchMediaMap(supabase, mediaIds, true);
    const enrichedItems = heroItems.map((item) => ({
      ...item,
      mediaUrl: item.media_asset_id
        ? mediaMap.get(item.media_asset_id)?.url ?? null
        : null,
    }));

    return toHomepageHeroCarousel(section, enrichedItems);
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

    const heroItems = (items ?? []) as HeroCmsSectionItemRow[];
    const mediaIds = heroItems
      .map((item) => item.media_asset_id)
      .filter((id): id is string => Boolean(id));
    const mediaMap = await fetchMediaMap(supabase, mediaIds, false);
    const enrichedItems = heroItems.map((item) => ({
      ...item,
      mediaUrl: item.media_asset_id
        ? mediaMap.get(item.media_asset_id)?.url ?? null
        : null,
    }));

    return toHomepageHeroCarousel(section, enrichedItems);
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

  const mediaIds = Array.from(
    new Set(
      input.slides
        .map((slide) => slide.imageMediaAssetId)
        .filter((id): id is string => Boolean(id))
    )
  );
  await assertMediaAssetsAreImages(supabase, mediaIds);

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
    media_asset_id: slide.imageMediaAssetId ?? null,
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

/* -------------------------------------------------------------------------- */
/* Homepage category circles                                                  */
/* -------------------------------------------------------------------------- */

const CATEGORY_CIRCLES_SECTION_KEY = "homepage.category_circles";
const CATEGORY_ITEM_COLUMNS =
  "id,item_key,title,href,settings,sort_order,is_enabled,media_asset_id";

export async function readHomepageCategoryCircles(): Promise<HomepageCategoryCircles> {
  const supabase = createSupabaseAnonServerClient();

  if (!supabase) {
    return fallbackHomepageCategoryCircles;
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", CATEGORY_CIRCLES_SECTION_KEY)
      .maybeSingle();

    if (sectionError || !section) {
      return fallbackHomepageCategoryCircles;
    }

    if (!section.is_enabled) {
      return toHomepageCategoryCircles(section, []);
    }

    const { data: items, error: itemsError } = await supabase
      .from("cms_section_items")
      .select(CATEGORY_ITEM_COLUMNS)
      .eq("section_id", section.id)
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });

    if (itemsError || !items) {
      return fallbackHomepageCategoryCircles;
    }

    const mediaIds = new Set<string>();
    items.forEach((item) => {
      if (item.media_asset_id) mediaIds.add(item.media_asset_id);
      const settings = item.settings as Record<string, unknown>;
      if (settings?.hoverMediaAssetId) mediaIds.add(settings.hoverMediaAssetId as string);
    });

    const mediaMap = new Map<string, { id: string; url: string; mime_type: string | null }>();
    if (mediaIds.size > 0) {
      const { data: mediaAssets } = await supabase
        .from("media_assets")
        .select("id, url, mime_type")
        .in("id", Array.from(mediaIds))
        .eq("is_public", true);

      if (mediaAssets) {
        mediaAssets.forEach((m) => mediaMap.set(m.id, m));
      }
    }

    const enrichedItems: CategoryCmsSectionItemRow[] = items.map((item) => {
      let mediaUrl = null;
      let mediaMimeType = null;
      let hoverMediaUrl = null;
      let hoverMediaMimeType = null;

      if (item.media_asset_id) {
        const asset = mediaMap.get(item.media_asset_id);
        if (asset) {
          mediaUrl = asset.url;
          mediaMimeType = asset.mime_type;
        }
      }

      const settings = item.settings as Record<string, unknown>;
      const hoverMediaAssetId = settings?.hoverMediaAssetId as string | undefined;
      if (hoverMediaAssetId) {
        const hoverAsset = mediaMap.get(hoverMediaAssetId);
        if (hoverAsset) {
          hoverMediaUrl = hoverAsset.url;
          hoverMediaMimeType = hoverAsset.mime_type;
        }
      }

      return {
        ...item,
        mediaUrl,
        mediaMimeType,
        hoverMediaUrl,
        hoverMediaMimeType,
      };
    });

    return toHomepageCategoryCircles(section, enrichedItems);
  } catch {
    return fallbackHomepageCategoryCircles;
  }
}

export async function readAdminHomepageCategoryCircles(): Promise<HomepageCategoryCircles> {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    return fallbackHomepageCategoryCircles;
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", CATEGORY_CIRCLES_SECTION_KEY)
      .maybeSingle();

    if (sectionError || !section) {
      return fallbackHomepageCategoryCircles;
    }

    const { data: items, error: itemsError } = await supabase
      .from("cms_section_items")
      .select(CATEGORY_ITEM_COLUMNS)
      .eq("section_id", section.id)
      .order("sort_order", { ascending: true });

    if (itemsError || !items) {
      return fallbackHomepageCategoryCircles;
    }

    const mediaIds = new Set<string>();
    items.forEach((item) => {
      if (item.media_asset_id) mediaIds.add(item.media_asset_id);
      const settings = item.settings as Record<string, unknown>;
      if (settings?.hoverMediaAssetId) mediaIds.add(settings.hoverMediaAssetId as string);
    });

    const mediaMap = new Map<string, { id: string; url: string; mime_type: string | null }>();
    if (mediaIds.size > 0) {
      const { data: mediaAssets } = await supabase
        .from("media_assets")
        .select("id, url, mime_type")
        .in("id", Array.from(mediaIds));

      if (mediaAssets) {
        mediaAssets.forEach((m) => mediaMap.set(m.id, m));
      }
    }

    const enrichedItems: CategoryCmsSectionItemRow[] = items.map((item) => {
      let mediaUrl = null;
      let mediaMimeType = null;
      let hoverMediaUrl = null;
      let hoverMediaMimeType = null;

      if (item.media_asset_id) {
        const asset = mediaMap.get(item.media_asset_id);
        if (asset) {
          mediaUrl = asset.url;
          mediaMimeType = asset.mime_type;
        }
      }

      const settings = item.settings as Record<string, unknown>;
      const hoverMediaAssetId = settings?.hoverMediaAssetId as string | undefined;
      if (hoverMediaAssetId) {
        const hoverAsset = mediaMap.get(hoverMediaAssetId);
        if (hoverAsset) {
          hoverMediaUrl = hoverAsset.url;
          hoverMediaMimeType = hoverAsset.mime_type;
        }
      }

      return {
        ...item,
        mediaUrl,
        mediaMimeType,
        hoverMediaUrl,
        hoverMediaMimeType,
      };
    });

    return toHomepageCategoryCircles(section, enrichedItems);
  } catch {
    return fallbackHomepageCategoryCircles;
  }
}

export async function writeHomepageCategoryCircles(
  input: HomepageCategoryCirclesInput,
  adminId: string
) {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    throw new Error("Supabase service client is not configured.");
  }

  const mediaIds = new Set<string>();
  input.items.forEach((item) => {
    if (item.imageMediaAssetId) mediaIds.add(item.imageMediaAssetId);
    if (item.hoverMediaAssetId) mediaIds.add(item.hoverMediaAssetId);
  });

  if (mediaIds.size > 0) {
    const { data: assets, error: assetError } = await supabase
      .from("media_assets")
      .select("id, mime_type")
      .in("id", Array.from(mediaIds));

    if (assetError || !assets || assets.length !== mediaIds.size) {
      throw new Error("Invalid media asset selected.");
    }

    const assetMap = new Map(assets.map((a) => [a.id, a.mime_type]));

    for (const item of input.items) {
      if (item.imageMediaAssetId) {
        const mime = assetMap.get(item.imageMediaAssetId);
        if (!mime?.startsWith("image/")) throw new Error("Normal media must be an image.");
      }
      if (item.hoverMediaAssetId) {
        const mime = assetMap.get(item.hoverMediaAssetId);
        if (!mime?.startsWith("image/") && !mime?.startsWith("video/")) throw new Error("Hover media must be image or video.");
      }
    }
  }

  const { data: section, error: sectionError } = await supabase
    .from("cms_sections")
    .upsert(
      {
        section_key: CATEGORY_CIRCLES_SECTION_KEY,
        section_type: "category_circles",
        name: "Homepage Category Circles",
        is_enabled: input.isEnabled,
        settings: {},
        updated_by: adminId,
      },
      { onConflict: "section_key" }
    )
    .select("id")
    .single();

  if (sectionError || !section) {
    throw new Error("Failed to save category circles section.");
  }

  const { error: deleteError } = await supabase
    .from("cms_section_items")
    .delete()
    .eq("section_id", section.id);

  if (deleteError) {
    throw new Error("Failed to replace category circles items.");
  }

  const rows = input.items.map((circle) => ({
    section_id: section.id,
    item_key: circle.id,
    title: circle.name,
    href: circle.href,
    media_asset_id: circle.imageMediaAssetId,
    settings: {
      slug: circle.slug,
      productCount: circle.productCount,
      image: circle.image,
      hoverMediaAssetId: circle.hoverMediaAssetId,
    },
    sort_order: circle.sortOrder,
    is_enabled: circle.isEnabled,
    updated_by: adminId,
  }));

  if (rows.length === 0) return;

  const { error: insertError } = await supabase
    .from("cms_section_items")
    .insert(rows);

  if (insertError) {
    throw new Error("Failed to save category circles items.");
  }
}

/* -------------------------------------------------------------------------- */
/* Homepage bento gallery                                                     */
/* -------------------------------------------------------------------------- */

const BENTO_GALLERY_SECTION_KEY = "homepage.bento_gallery";
const BENTO_ITEM_COLUMNS =
  "id,item_key,title,subtitle,body,href,settings,sort_order,is_enabled,media_asset_id";

function collectMediaIds(
  items: { media_asset_id?: string | null }[]
): string[] {
  const ids = new Set<string>();
  items.forEach((item) => {
    if (item.media_asset_id) ids.add(item.media_asset_id);
  });
  return Array.from(ids);
}

export async function readHomepageBentoGallery(): Promise<HomepageBentoGallery> {
  const supabase = createSupabaseAnonServerClient();

  if (!supabase) {
    return fallbackHomepageBentoGallery;
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", BENTO_GALLERY_SECTION_KEY)
      .maybeSingle();

    if (sectionError || !section) {
      return fallbackHomepageBentoGallery;
    }

    if (!section.is_enabled) {
      return toHomepageBentoGallery(section, []);
    }

    const { data: items, error: itemsError } = await supabase
      .from("cms_section_items")
      .select(BENTO_ITEM_COLUMNS)
      .eq("section_id", section.id)
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });

    if (itemsError || !items) {
      return fallbackHomepageBentoGallery;
    }

    const mediaMap = await fetchMediaMap(supabase, collectMediaIds(items), true);

    const enriched: BentoCmsSectionItemRow[] = items.map((item) => ({
      ...item,
      mediaUrl: item.media_asset_id
        ? mediaMap.get(item.media_asset_id)?.url ?? null
        : null,
    }));

    return toHomepageBentoGallery(section, enriched);
  } catch {
    return fallbackHomepageBentoGallery;
  }
}

export async function readAdminHomepageBentoGallery(): Promise<HomepageBentoGallery> {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    return fallbackHomepageBentoGallery;
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", BENTO_GALLERY_SECTION_KEY)
      .maybeSingle();

    if (sectionError || !section) {
      return fallbackHomepageBentoGallery;
    }

    const { data: items, error: itemsError } = await supabase
      .from("cms_section_items")
      .select(BENTO_ITEM_COLUMNS)
      .eq("section_id", section.id)
      .order("sort_order", { ascending: true });

    if (itemsError || !items) {
      return fallbackHomepageBentoGallery;
    }

    const mediaMap = await fetchMediaMap(supabase, collectMediaIds(items), false);

    const enriched: BentoCmsSectionItemRow[] = items.map((item) => ({
      ...item,
      mediaUrl: item.media_asset_id
        ? mediaMap.get(item.media_asset_id)?.url ?? null
        : null,
    }));

    return toHomepageBentoGallery(section, enriched);
  } catch {
    return fallbackHomepageBentoGallery;
  }
}

async function assertMediaAssetsAreImages(
  supabase: ServerSupabaseClient,
  ids: string[]
) {
  if (ids.length === 0) return;

  const { data: assets, error } = await supabase
    .from("media_assets")
    .select("id, mime_type")
    .in("id", ids);

  if (error || !assets || assets.length !== ids.length) {
    throw new Error("Invalid media asset selected.");
  }

  for (const asset of assets) {
    if (!asset.mime_type?.startsWith("image/")) {
      throw new Error("Normal media must be an image.");
    }
  }
}

export async function writeHomepageBentoGallery(
  input: HomepageBentoGalleryInput,
  adminId: string
) {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    throw new Error("Supabase service client is not configured.");
  }

  const mediaIds = Array.from(
    new Set(
      input.items
        .map((item) => item.imageMediaAssetId)
        .filter((id): id is string => Boolean(id))
    )
  );
  await assertMediaAssetsAreImages(supabase, mediaIds);

  const { data: section, error: sectionError } = await supabase
    .from("cms_sections")
    .upsert(
      {
        section_key: BENTO_GALLERY_SECTION_KEY,
        section_type: "bento_gallery",
        name: "Homepage Bento Gallery",
        is_enabled: input.isEnabled,
        settings: {
          eyebrow: input.eyebrow,
          heading: input.heading,
          description: input.description,
        },
        updated_by: adminId,
      },
      { onConflict: "section_key" }
    )
    .select("id")
    .single();

  if (sectionError || !section) {
    throw new Error("Failed to save bento gallery section.");
  }

  const { error: deleteError } = await supabase
    .from("cms_section_items")
    .delete()
    .eq("section_id", section.id);

  if (deleteError) {
    throw new Error("Failed to replace bento gallery items.");
  }

  const rows = input.items.map((item, index) => ({
    section_id: section.id,
    item_key: `bento-${index + 1}`,
    title: item.title,
    subtitle: item.subtitle,
    body: item.body,
    href: item.href,
    media_asset_id: item.imageMediaAssetId ?? null,
    settings: {
      localImagePath: item.image,
      tileType: item.tileType,
      layout: item.layout,
      badgeText: item.badgeText,
      accentColor: item.accentColor,
      ctaLabel: item.ctaLabel,
    },
    sort_order: item.sortOrder,
    is_enabled: item.isEnabled,
    updated_by: adminId,
  }));

  if (rows.length === 0) return;

  const { error: insertError } = await supabase
    .from("cms_section_items")
    .insert(rows);

  if (insertError) {
    throw new Error("Failed to save bento gallery items.");
  }
}

/* -------------------------------------------------------------------------- */
/* Homepage merchandising banners                                             */
/* -------------------------------------------------------------------------- */

const MERCHANDISING_SECTION_KEY = "homepage.merchandising_banners";
const MERCH_ITEM_COLUMNS =
  "id,item_key,title,subtitle,body,href,settings,sort_order,is_enabled,media_asset_id";

export async function readHomepageMerchandisingBanners(): Promise<HomepageMerchandisingBanners> {
  const supabase = createSupabaseAnonServerClient();

  if (!supabase) {
    return fallbackHomepageMerchandisingBanners;
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", MERCHANDISING_SECTION_KEY)
      .maybeSingle();

    if (sectionError || !section) {
      return fallbackHomepageMerchandisingBanners;
    }

    if (!section.is_enabled) {
      return toHomepageMerchandisingBanners(section, []);
    }

    const { data: items, error: itemsError } = await supabase
      .from("cms_section_items")
      .select(MERCH_ITEM_COLUMNS)
      .eq("section_id", section.id)
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });

    if (itemsError || !items) {
      return fallbackHomepageMerchandisingBanners;
    }

    const mediaMap = await fetchMediaMap(supabase, collectMediaIds(items), true);

    const enriched: MerchCmsSectionItemRow[] = items.map((item) => ({
      ...item,
      mediaUrl: item.media_asset_id
        ? mediaMap.get(item.media_asset_id)?.url ?? null
        : null,
    }));

    return toHomepageMerchandisingBanners(section, enriched);
  } catch {
    return fallbackHomepageMerchandisingBanners;
  }
}

export async function readAdminHomepageMerchandisingBanners(): Promise<HomepageMerchandisingBanners> {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    return fallbackHomepageMerchandisingBanners;
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", MERCHANDISING_SECTION_KEY)
      .maybeSingle();

    if (sectionError || !section) {
      return fallbackHomepageMerchandisingBanners;
    }

    const { data: items, error: itemsError } = await supabase
      .from("cms_section_items")
      .select(MERCH_ITEM_COLUMNS)
      .eq("section_id", section.id)
      .order("sort_order", { ascending: true });

    if (itemsError || !items) {
      return fallbackHomepageMerchandisingBanners;
    }

    const mediaMap = await fetchMediaMap(supabase, collectMediaIds(items), false);

    const enriched: MerchCmsSectionItemRow[] = items.map((item) => ({
      ...item,
      mediaUrl: item.media_asset_id
        ? mediaMap.get(item.media_asset_id)?.url ?? null
        : null,
    }));

    return toHomepageMerchandisingBanners(section, enriched);
  } catch {
    return fallbackHomepageMerchandisingBanners;
  }
}

export async function writeHomepageMerchandisingBanners(
  input: HomepageMerchandisingBannersInput,
  adminId: string
) {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    throw new Error("Supabase service client is not configured.");
  }

  const mediaIds = Array.from(
    new Set(
      input.slides
        .map((slide) => slide.imageMediaAssetId)
        .filter((id): id is string => Boolean(id))
    )
  );
  await assertMediaAssetsAreImages(supabase, mediaIds);

  const { data: section, error: sectionError } = await supabase
    .from("cms_sections")
    .upsert(
      {
        section_key: MERCHANDISING_SECTION_KEY,
        section_type: "merchandising_banners",
        name: "Homepage Merchandising Banners",
        is_enabled: input.isEnabled,
        settings: {
          autoplaySeconds: input.autoplaySeconds,
          eyebrow: input.eyebrow,
        },
        updated_by: adminId,
      },
      { onConflict: "section_key" }
    )
    .select("id")
    .single();

  if (sectionError || !section) {
    throw new Error("Failed to save merchandising banners section.");
  }

  const { error: deleteError } = await supabase
    .from("cms_section_items")
    .delete()
    .eq("section_id", section.id);

  if (deleteError) {
    throw new Error("Failed to replace merchandising banners.");
  }

  const rows = input.slides.map((slide, index) => ({
    section_id: section.id,
    item_key: `slide-${index + 1}`,
    title: slide.title,
    subtitle: slide.subtitle,
    body: slide.body,
    href: slide.primaryCtaHref,
    media_asset_id: slide.imageMediaAssetId ?? null,
    settings: {
      localImagePath: slide.image,
      badgeText: slide.badgeText,
      accentColor: slide.accentColor,
      primaryCtaLabel: slide.primaryCtaLabel,
      secondaryCtaLabel: slide.secondaryCtaLabel,
      secondaryCtaHref: slide.secondaryCtaHref,
      features: slide.features,
    },
    sort_order: slide.sortOrder,
    is_enabled: slide.isEnabled,
    updated_by: adminId,
  }));

  if (rows.length === 0) return;

  const { error: insertError } = await supabase
    .from("cms_section_items")
    .insert(rows);

  if (insertError) {
    throw new Error("Failed to save merchandising banners.");
  }
}

/* -------------------------------------------------------------------------- */
/* Site footer                                                                */
/* -------------------------------------------------------------------------- */

const SITE_FOOTER_SECTION_KEY = "homepage.footer";
const SITE_FOOTER_ITEM_COLUMNS =
  "id,item_key,title,href,settings,sort_order,is_enabled";

export async function readSiteFooter(): Promise<SiteFooterContent> {
  const supabase = createSupabaseAnonServerClient();

  if (!supabase) {
    return fallbackSiteFooter;
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", SITE_FOOTER_SECTION_KEY)
      .maybeSingle();

    if (sectionError || !section) {
      return fallbackSiteFooter;
    }

    if (!section.is_enabled) {
      return toSiteFooter(section, []);
    }

    const { data: items, error: itemsError } = await supabase
      .from("cms_section_items")
      .select(SITE_FOOTER_ITEM_COLUMNS)
      .eq("section_id", section.id)
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });

    if (itemsError || !items) {
      return fallbackSiteFooter;
    }

    return toSiteFooter(section, items as SiteFooterCmsSectionItemRow[]);
  } catch {
    return fallbackSiteFooter;
  }
}

export async function readAdminSiteFooter(): Promise<SiteFooterContent> {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    return fallbackSiteFooter;
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", SITE_FOOTER_SECTION_KEY)
      .maybeSingle();

    if (sectionError || !section) {
      return fallbackSiteFooter;
    }

    const { data: items, error: itemsError } = await supabase
      .from("cms_section_items")
      .select(SITE_FOOTER_ITEM_COLUMNS)
      .eq("section_id", section.id)
      .order("sort_order", { ascending: true });

    if (itemsError || !items) {
      return fallbackSiteFooter;
    }

    return toSiteFooter(section, items as SiteFooterCmsSectionItemRow[]);
  } catch {
    return fallbackSiteFooter;
  }
}

export async function writeSiteFooter(input: SiteFooterInput, adminId: string) {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    throw new Error("Supabase service client is not configured.");
  }

  const { data: section, error: sectionError } = await supabase
    .from("cms_sections")
    .upsert(
      {
        section_key: SITE_FOOTER_SECTION_KEY,
        section_type: "site_footer",
        name: "Site Footer",
        is_enabled: input.isEnabled,
        settings: {
          logoPath: input.logoPath,
          logoAlt: input.logoAlt,
          copyrightText: input.copyrightText,
        },
        updated_by: adminId,
      },
      { onConflict: "section_key" }
    )
    .select("id")
    .single();

  if (sectionError || !section) {
    throw new Error("Failed to save footer section.");
  }

  const { error: deleteError } = await supabase
    .from("cms_section_items")
    .delete()
    .eq("section_id", section.id);

  if (deleteError) {
    throw new Error("Failed to replace footer content.");
  }

  const linkRows = input.links.map((link, index) => ({
    section_id: section.id,
    item_key: `footer-link-${index + 1}`,
    title: link.label,
    href: link.href,
    settings: {
      kind: "link",
      group: link.group,
    },
    sort_order: link.sortOrder,
    is_enabled: link.isEnabled,
    updated_by: adminId,
  }));

  const socialRows = input.socialLinks.map((socialLink, index) => ({
    section_id: section.id,
    item_key: `footer-social-${index + 1}`,
    title: socialLink.label,
    href: socialLink.href,
    settings: {
      kind: "social",
      platform: socialLink.platform,
      backgroundColor: socialLink.backgroundColor,
    },
    sort_order: socialLink.sortOrder,
    is_enabled: socialLink.isEnabled,
    updated_by: adminId,
  }));

  const rows = [...linkRows, ...socialRows];

  if (rows.length === 0) return;

  const { error: insertError } = await supabase
    .from("cms_section_items")
    .insert(rows);

  if (insertError) {
    throw new Error("Failed to save footer content.");
  }
}
