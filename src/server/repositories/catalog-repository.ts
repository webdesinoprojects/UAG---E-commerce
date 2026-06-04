import "server-only";

import {
  createSupabaseAnonServerClient,
  createSupabaseServiceRoleClient,
} from "@/server/db/supabase";
import {
  mapCatalogCategoryRowToDto,
  type CatalogCategoryInput,
  type CatalogCategoryRow,
} from "@/server/validators/catalog";
import type { CatalogCategoryDto } from "@/features/catalog/types";

type ServerSupabaseClient = NonNullable<
  ReturnType<typeof createSupabaseAnonServerClient>
>;

const CATEGORY_COLUMNS =
  "id,parent_id,name,slug,description,media_asset_id,banner_media_asset_id,sort_order,is_active,is_featured,seo_title,seo_description,created_at,updated_at";

function collectCategoryMediaIds(rows: CatalogCategoryRow[]) {
  const ids = new Set<string>();
  rows.forEach((row) => {
    if (row.media_asset_id) ids.add(row.media_asset_id);
    if (row.banner_media_asset_id) ids.add(row.banner_media_asset_id);
  });
  return Array.from(ids);
}

async function fetchMediaUrls(
  client: ServerSupabaseClient,
  ids: string[],
  publicOnly: boolean
) {
  const urls = new Map<string, string>();

  if (ids.length === 0) return urls;

  let query = client.from("media_assets").select("id,url,mime_type").in("id", ids);

  if (publicOnly) {
    query = query.eq("is_public", true);
  }

  const { data } = await query;

  data?.forEach((asset) => {
    if (asset.mime_type?.startsWith("image/")) {
      urls.set(asset.id, asset.url);
    }
  });

  return urls;
}

async function fetchProductCounts(client: ServerSupabaseClient) {
  const counts = new Map<string, number>();
  const { data } = await client.from("catalog_products").select("category_id");

  data?.forEach((product) => {
    if (!product.category_id) return;
    counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1);
  });

  return counts;
}

export async function readPublicCatalogCategories(): Promise<CatalogCategoryDto[]> {
  const client = createSupabaseAnonServerClient();

  if (!client) return [];

  try {
    const { data, error } = await client
      .from("catalog_categories")
      .select(CATEGORY_COLUMNS)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data) return [];

    const rows = data as CatalogCategoryRow[];
    const mediaUrls = await fetchMediaUrls(client, collectCategoryMediaIds(rows), true);

    return rows.map((row) => mapCatalogCategoryRowToDto(row, mediaUrls, 0));
  } catch {
    return [];
  }
}

export async function readAdminCatalogCategories(): Promise<CatalogCategoryDto[]> {
  const client = createSupabaseServiceRoleClient();

  if (!client) return [];

  try {
    const { data, error } = await client
      .from("catalog_categories")
      .select(CATEGORY_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data) return [];

    const rows = data as CatalogCategoryRow[];
    const [mediaUrls, productCounts] = await Promise.all([
      fetchMediaUrls(client, collectCategoryMediaIds(rows), false),
      fetchProductCounts(client),
    ]);

    return rows.map((row) =>
      mapCatalogCategoryRowToDto(row, mediaUrls, productCounts.get(row.id) ?? 0)
    );
  } catch {
    return [];
  }
}

async function assertCategoryMediaAreImages(
  client: ServerSupabaseClient,
  ids: string[]
) {
  if (ids.length === 0) return;

  const { data, error } = await client
    .from("media_assets")
    .select("id,mime_type")
    .in("id", ids);

  if (error || !data || data.length !== ids.length) {
    throw new Error("Invalid media asset selected.");
  }

  data.forEach((asset) => {
    if (!asset.mime_type?.startsWith("image/")) {
      throw new Error("Category media must be an image.");
    }
  });
}

export async function upsertCatalogCategory(
  input: CatalogCategoryInput,
  adminId: string
) {
  const client = createSupabaseServiceRoleClient();

  if (!client) {
    throw new Error("Database not available.");
  }

  const mediaIds = [
    input.mediaAssetId,
    input.bannerMediaAssetId,
  ].filter((id): id is string => Boolean(id));

  await assertCategoryMediaAreImages(client, Array.from(new Set(mediaIds)));

  const row = {
    parent_id: input.parentId,
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    media_asset_id: input.mediaAssetId,
    banner_media_asset_id: input.bannerMediaAssetId,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    is_featured: input.isFeatured,
    seo_title: input.seoTitle || null,
    seo_description: input.seoDescription || null,
    updated_by: adminId,
  };

  const query = input.id
    ? client
        .from("catalog_categories")
        .update(row)
        .eq("id", input.id)
        .select("id")
        .single()
    : client.from("catalog_categories").insert(row).select("id").single();

  const { error } = await query;

  if (error) {
    throw new Error("Failed to save category.");
  }
}
