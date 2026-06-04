import "server-only";

import {
  createSupabaseAnonServerClient,
  createSupabaseServiceRoleClient,
} from "@/server/db/supabase";
import {
  mapCatalogCategoryRowToDto,
  type CatalogCategoryInput,
  type CatalogCategoryRow,
  type CatalogProductCreateInput,
} from "@/server/validators/catalog";
import type {
  AdminProductDetailDto,
  AdminProductListItemDto,
  CatalogCategoryDto,
} from "@/features/catalog/types";

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

// --- Product List ---

const PRODUCT_LIST_COLUMNS =
  "id,name,slug,sku,category_id,brand,status,price_cents,compare_at_price_cents,currency,stock_quantity,low_stock_threshold,is_featured,is_new_arrival,is_popular,created_at,updated_at";

type CatalogProductListRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category_id: string | null;
  brand: string;
  status: "draft" | "active" | "archived";
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
};

export async function readAdminProductList(): Promise<AdminProductListItemDto[]> {
  const client = createSupabaseServiceRoleClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("catalog_products")
      .select(PRODUCT_LIST_COLUMNS)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    const rows = data as CatalogProductListRow[];
    if (rows.length === 0) return [];

    // Batch fetch category names
    const categoryIds = [
      ...new Set(rows.map((r) => r.category_id).filter(Boolean)),
    ] as string[];
    const categoryNameMap = new Map<string, string>();

    if (categoryIds.length > 0) {
      const { data: cats } = await client
        .from("catalog_categories")
        .select("id,name")
        .in("id", categoryIds);
      cats?.forEach((c) => categoryNameMap.set(c.id, c.name));
    }

    // Batch fetch primary media
    const productIds = rows.map((r) => r.id);
    const primaryMediaMap = new Map<string, { mediaAssetId: string; url: string }>();

    const { data: mediaRows } = await client
      .from("catalog_product_media")
      .select("product_id,media_asset_id")
      .in("product_id", productIds)
      .eq("placement", "thumbnail")
      .eq("is_primary", true)
      .eq("is_enabled", true);

    if (mediaRows && mediaRows.length > 0) {
      const assetIds = mediaRows.map((m) => m.media_asset_id);
      const { data: assets } = await client
        .from("media_assets")
        .select("id,url,mime_type")
        .in("id", assetIds);

      const assetUrlMap = new Map<string, string>();
      assets?.forEach((a) => {
        if (a.mime_type?.startsWith("image/")) assetUrlMap.set(a.id, a.url);
      });

      mediaRows.forEach((m) => {
        const url = assetUrlMap.get(m.media_asset_id);
        if (url) {
          primaryMediaMap.set(m.product_id, { mediaAssetId: m.media_asset_id, url });
        }
      });
    }

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      categoryId: row.category_id,
      categoryName: row.category_id ? (categoryNameMap.get(row.category_id) ?? null) : null,
      brand: row.brand,
      status: row.status,
      priceCents: row.price_cents,
      compareAtPriceCents: row.compare_at_price_cents,
      currency: row.currency,
      stockQuantity: row.stock_quantity,
      lowStockThreshold: row.low_stock_threshold,
      isFeatured: row.is_featured,
      isNewArrival: row.is_new_arrival,
      isPopular: row.is_popular,
      primaryImageUrl: primaryMediaMap.get(row.id)?.url ?? null,
      primaryMediaAssetId: primaryMediaMap.get(row.id)?.mediaAssetId ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch {
    return [];
  }
}

// --- Product Create ---

async function assertProductPrimaryMediaIsImage(
  client: ServerSupabaseClient,
  id: string
) {
  const { data, error } = await client
    .from("media_assets")
    .select("id,mime_type")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) throw new Error("Invalid media asset selected.");
  if (!data.mime_type?.startsWith("image/"))
    throw new Error("Primary product image must be an image file.");
}

export async function createCatalogProduct(
  input: CatalogProductCreateInput,
  adminId: string
): Promise<{ id: string }> {
  const client = createSupabaseServiceRoleClient();
  if (!client) throw new Error("Database not available.");

  if (input.categoryId) {
    const { data: cat, error: catErr } = await client
      .from("catalog_categories")
      .select("id")
      .eq("id", input.categoryId)
      .maybeSingle();
    if (catErr || !cat) throw new Error("Selected category does not exist.");
  }

  if (input.primaryMediaAssetId) {
    await assertProductPrimaryMediaIsImage(client, input.primaryMediaAssetId);
  }

  const { data: product, error: productErr } = await client
    .from("catalog_products")
    .insert({
      name: input.name,
      slug: input.slug,
      sku: input.sku,
      category_id: input.categoryId,
      brand: input.brand,
      short_description: input.shortDescription || null,
      description: input.description || null,
      price_cents: input.priceCents,
      compare_at_price_cents: input.compareAtPriceCents,
      currency: input.currency,
      stock_quantity: input.stockQuantity,
      low_stock_threshold: input.lowStockThreshold,
      status: input.status,
      is_featured: input.isFeatured,
      is_new_arrival: input.isNewArrival,
      is_popular: input.isPopular,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      updated_by: adminId,
    })
    .select("id")
    .single();

  if (productErr || !product) throw new Error("Failed to create product.");

  if (input.primaryMediaAssetId) {
    const { error: mediaErr } = await client.from("catalog_product_media").insert({
      product_id: product.id,
      media_asset_id: input.primaryMediaAssetId,
      placement: "thumbnail",
      is_primary: true,
      sort_order: 0,
      is_enabled: true,
      updated_by: adminId,
    });
    if (mediaErr) {
      // Roll back the just-created product to avoid an orphaned row.
      await client.from("catalog_products").delete().eq("id", product.id);
      throw new Error("Failed to link primary image. Product was not saved.");
    }
  }

  return { id: product.id };
}

// --- Product Detail / Edit ---

const PRODUCT_DETAIL_COLUMNS =
  "id,name,slug,sku,category_id,brand,status,price_cents,compare_at_price_cents,currency,stock_quantity,low_stock_threshold,is_featured,is_new_arrival,is_popular,short_description,description,seo_title,seo_description,created_at,updated_at";

type CatalogProductDetailRow = CatalogProductListRow & {
  short_description: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export async function readAdminProductById(
  productId: string
): Promise<AdminProductDetailDto | null> {
  const client = createSupabaseServiceRoleClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("catalog_products")
      .select(PRODUCT_DETAIL_COLUMNS)
      .eq("id", productId)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as CatalogProductDetailRow;

    let categoryName: string | null = null;
    if (row.category_id) {
      const { data: cat } = await client
        .from("catalog_categories")
        .select("name")
        .eq("id", row.category_id)
        .maybeSingle();
      categoryName = cat?.name ?? null;
    }

    let primaryImageUrl: string | null = null;
    let primaryMediaAssetId: string | null = null;

    const { data: mediaRow } = await client
      .from("catalog_product_media")
      .select("media_asset_id")
      .eq("product_id", productId)
      .eq("placement", "thumbnail")
      .eq("is_primary", true)
      .eq("is_enabled", true)
      .maybeSingle();

    if (mediaRow?.media_asset_id) {
      const { data: asset } = await client
        .from("media_assets")
        .select("url,mime_type")
        .eq("id", mediaRow.media_asset_id)
        .maybeSingle();

      if (asset?.mime_type?.startsWith("image/")) {
        primaryImageUrl = asset.url;
        primaryMediaAssetId = mediaRow.media_asset_id;
      }
    }

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      categoryId: row.category_id,
      categoryName,
      brand: row.brand,
      status: row.status,
      priceCents: row.price_cents,
      compareAtPriceCents: row.compare_at_price_cents,
      currency: row.currency,
      stockQuantity: row.stock_quantity,
      lowStockThreshold: row.low_stock_threshold,
      isFeatured: row.is_featured,
      isNewArrival: row.is_new_arrival,
      isPopular: row.is_popular,
      primaryImageUrl,
      primaryMediaAssetId,
      shortDescription: row.short_description ?? "",
      description: row.description ?? "",
      seoTitle: row.seo_title ?? "",
      seoDescription: row.seo_description ?? "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch {
    return null;
  }
}

export async function updateCatalogProduct(
  productId: string,
  input: CatalogProductCreateInput,
  adminId: string
): Promise<void> {
  const client = createSupabaseServiceRoleClient();
  if (!client) throw new Error("Database not available.");

  if (input.categoryId) {
    const { data: cat, error: catErr } = await client
      .from("catalog_categories")
      .select("id")
      .eq("id", input.categoryId)
      .maybeSingle();
    if (catErr || !cat) throw new Error("Selected category does not exist.");
  }

  if (input.primaryMediaAssetId) {
    await assertProductPrimaryMediaIsImage(client, input.primaryMediaAssetId);
  }

  // Use .select + .maybeSingle to detect missing product (fix: silent no-op on wrong ID).
  const { data: updated, error: updateErr } = await client
    .from("catalog_products")
    .update({
      name: input.name,
      slug: input.slug,
      sku: input.sku,
      category_id: input.categoryId,
      brand: input.brand,
      short_description: input.shortDescription || null,
      description: input.description || null,
      price_cents: input.priceCents,
      compare_at_price_cents: input.compareAtPriceCents,
      currency: input.currency,
      stock_quantity: input.stockQuantity,
      low_stock_threshold: input.lowStockThreshold,
      status: input.status,
      is_featured: input.isFeatured,
      is_new_arrival: input.isNewArrival,
      is_popular: input.isPopular,
      seo_title: input.seoTitle || null,
      seo_description: input.seoDescription || null,
      updated_by: adminId,
    })
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (updateErr) throw new Error("Failed to update product.");
  if (!updated) throw new Error("Product not found.");

  // Safe thumbnail replacement:
  //   if setting a new image  -> insert new row first, then remove old rows
  //   if clearing the image   -> remove existing thumbnail rows directly
  // This order ensures a failed insert leaves the previous thumbnail intact.
  if (input.primaryMediaAssetId) {
    const { data: newMedia, error: mediaInsertErr } = await client
      .from("catalog_product_media")
      .insert({
        product_id: productId,
        media_asset_id: input.primaryMediaAssetId,
        placement: "thumbnail",
        is_primary: true,
        sort_order: 0,
        is_enabled: true,
        updated_by: adminId,
      })
      .select("id")
      .single();

    if (mediaInsertErr || !newMedia) {
      // Product fields are already updated; image link failed but old thumbnail is preserved.
      throw new Error("Product updated but failed to link the new primary image.");
    }

    // New row confirmed — now safely remove the previous thumbnail(s).
    await client
      .from("catalog_product_media")
      .delete()
      .eq("product_id", productId)
      .eq("placement", "thumbnail")
      .eq("is_primary", true)
      .neq("id", newMedia.id);
  } else {
    // Intentionally clearing the primary thumbnail.
    await client
      .from("catalog_product_media")
      .delete()
      .eq("product_id", productId)
      .eq("placement", "thumbnail")
      .eq("is_primary", true);
  }
}

export async function updateCatalogProductStatus(
  productId: string,
  status: "draft" | "active" | "archived",
  adminId: string
): Promise<void> {
  const client = createSupabaseServiceRoleClient();
  if (!client) throw new Error("Database not available.");

  const { data: updated, error } = await client
    .from("catalog_products")
    .update({ status, updated_by: adminId })
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error("Failed to update product status.");
  if (!updated) throw new Error("Product not found.");
}

export async function deleteDraftCatalogProduct(productId: string): Promise<void> {
  const client = createSupabaseServiceRoleClient();
  if (!client) throw new Error("Database not available.");

  const { data: product, error: fetchErr } = await client
    .from("catalog_products")
    .select("id,status")
    .eq("id", productId)
    .maybeSingle();

  if (fetchErr || !product) throw new Error("Product not found.");
  if (product.status !== "draft") throw new Error("Only draft products can be deleted.");

  await client.from("catalog_product_media").delete().eq("product_id", productId);

  const { error: deleteErr } = await client
    .from("catalog_products")
    .delete()
    .eq("id", productId);

  if (deleteErr) throw new Error("Failed to delete product.");
}
