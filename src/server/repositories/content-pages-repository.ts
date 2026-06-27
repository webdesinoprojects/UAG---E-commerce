import "server-only";

import {
  createSupabaseAnonServerClient,
  createSupabaseServiceRoleClient,
} from "@/server/db/supabase";
import type { ContentPage, ContentPageKey } from "@/features/content-pages/types";
import {
  fallbackContentPages,
  toContentPage,
  type ContentPageInput,
} from "@/server/validators/content-pages";

const SECTION_PREFIX = "site_page.";
const ITEM_COLUMNS =
  "id,item_key,title,body,href,settings,media_asset_id,sort_order,is_enabled";

type ServerSupabaseClient = NonNullable<
  ReturnType<typeof createSupabaseAnonServerClient>
>;

async function fetchMediaMap(
  supabase: ServerSupabaseClient,
  ids: string[],
  publicOnly: boolean
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  if (ids.length === 0) {
    return map;
  }

  let query = supabase.from("media_assets").select("id,url").in("id", ids);

  if (publicOnly) {
    query = query.eq("is_public", true);
  }

  const { data } = await query;

  if (data) {
    data.forEach((asset) => map.set(asset.id, asset.url));
  }

  return map;
}

async function assertMediaAssetsAreImages(
  supabase: ServerSupabaseClient,
  ids: string[]
) {
  if (ids.length === 0) return;

  const { data: assets, error } = await supabase
    .from("media_assets")
    .select("id,mime_type")
    .in("id", ids);

  if (error || !assets || assets.length !== ids.length) {
    throw new Error("Invalid media asset selected.");
  }

  for (const asset of assets) {
    if (!asset.mime_type?.startsWith("image/")) {
      throw new Error("Selected media must be an image.");
    }
  }
}

function sectionKey(key: ContentPageKey) {
  return `${SECTION_PREFIX}${key}`;
}

export async function readContentPage(key: ContentPageKey): Promise<ContentPage> {
  const supabase = createSupabaseAnonServerClient();

  if (!supabase) {
    return fallbackContentPages[key];
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", sectionKey(key))
      .maybeSingle();

    if (sectionError || !section || !section.is_enabled) {
      return fallbackContentPages[key];
    }

    const { data: items, error: itemError } = await supabase
      .from("cms_section_items")
      .select(ITEM_COLUMNS)
      .eq("section_id", section.id)
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });

    if (itemError) {
      return fallbackContentPages[key];
    }

    const mediaMap = await fetchMediaMap(
      supabase,
      (items ?? [])
        .map((item) => item.media_asset_id)
        .filter((id): id is string => Boolean(id)),
      true
    );
    const enrichedItems = (items ?? []).map((item) => ({
      ...item,
      mediaUrl: item.media_asset_id
        ? mediaMap.get(item.media_asset_id) ?? null
        : null,
    }));

    return toContentPage(key, section, enrichedItems);
  } catch {
    return fallbackContentPages[key];
  }
}

export async function readAdminContentPage(
  key: ContentPageKey
): Promise<ContentPage> {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    return fallbackContentPages[key];
  }

  try {
    const { data: section, error: sectionError } = await supabase
      .from("cms_sections")
      .select("id,is_enabled,settings")
      .eq("section_key", sectionKey(key))
      .maybeSingle();

    if (sectionError || !section) {
      return fallbackContentPages[key];
    }

    const { data: items, error: itemError } = await supabase
      .from("cms_section_items")
      .select(ITEM_COLUMNS)
      .eq("section_id", section.id)
      .order("sort_order", { ascending: true });

    if (itemError) {
      return fallbackContentPages[key];
    }

    const mediaMap = await fetchMediaMap(
      supabase,
      (items ?? [])
        .map((item) => item.media_asset_id)
        .filter((id): id is string => Boolean(id)),
      false
    );
    const enrichedItems = (items ?? []).map((item) => ({
      ...item,
      mediaUrl: item.media_asset_id
        ? mediaMap.get(item.media_asset_id) ?? null
        : null,
    }));

    return toContentPage(key, section, enrichedItems);
  } catch {
    return fallbackContentPages[key];
  }
}

export async function writeContentPage(
  input: ContentPageInput,
  adminId: string
) {
  const supabase = createSupabaseServiceRoleClient();

  if (!supabase) {
    throw new Error("Supabase service client is not configured.");
  }

  const mediaIds = Array.from(
    new Set(
      input.blocks
        .map((block) => block.imageMediaAssetId)
        .filter((id): id is string => Boolean(id))
    )
  );
  await assertMediaAssetsAreImages(supabase, mediaIds);

  const fallback = fallbackContentPages[input.key];
  const { data: section, error: sectionError } = await supabase
    .from("cms_sections")
    .upsert(
      {
        section_key: sectionKey(input.key),
        section_type: "content_page",
        name: fallback.adminTitle,
        is_enabled: true,
        settings: {
          eyebrow: input.eyebrow,
          title: input.title,
          description: input.description,
          image: input.image,
          paragraphs: input.paragraphs,
        },
        updated_by: adminId,
      },
      { onConflict: "section_key" }
    )
    .select("id")
    .single();

  if (sectionError || !section) {
    throw new Error("Failed to save content page.");
  }

  const { error: deleteError } = await supabase
    .from("cms_section_items")
    .delete()
    .eq("section_id", section.id);

  if (deleteError) {
    throw new Error("Failed to replace content blocks.");
  }

  const rows = input.blocks.map((block, index) => ({
    section_id: section.id,
    item_key: `block-${block.title.toLowerCase().replace(/\s+/g, "-")}`,
    title: block.title,
    body: block.body,
    href: block.href ?? null,
    media_asset_id: block.imageMediaAssetId ?? null,
    settings: {
      image: block.image ?? null,
      accentColor: block.accentColor ?? null,
      backgroundColor: block.backgroundColor ?? null,
      textColor: block.textColor ?? null,
      ctaLabel: block.ctaLabel ?? null,
    },
    sort_order: (index + 1) * 10,
    is_enabled: true,
    updated_by: adminId,
  }));

  const { error: insertError } = await supabase
    .from("cms_section_items")
    .insert(rows);

  if (insertError) {
    throw new Error("Failed to save content blocks.");
  }
}
