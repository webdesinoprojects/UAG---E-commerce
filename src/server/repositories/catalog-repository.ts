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
  type CatalogProductDraftMediaFormInput,
  type CatalogProductMediaFormInput,
} from "@/server/validators/catalog";
import type {
  AdminProductDetailDto,
  AdminProductListItemDto,
  AdminProductMediaItemDto,
  CatalogCategoryDto,
  CatalogProductMediaPlacement,
  FilterOptions,
  GetProductsParams,
  MediaItem,
  PaginatedProducts,
  ProductDetail,
} from "@/features/catalog/types";
import { PRODUCT_MEDIA_LIMITS } from "@/features/catalog/types";
import type { Product } from "@/features/catalog/components/product-card";

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
  const { data } = await client
    .from("catalog_products")
    .select("category_id")
    .eq("status", "active");

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
    const [mediaUrls, productCounts] = await Promise.all([
      fetchMediaUrls(client, collectCategoryMediaIds(rows), true),
      fetchProductCounts(client),
    ]);

    return rows.map((row) =>
      mapCatalogCategoryRowToDto(
        row,
        mediaUrls,
        productCounts.get(row.id) ?? 0
      )
    );
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
  adminId: string,
  mediaItems: CatalogProductDraftMediaFormInput["items"] = []
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

  const hasStagedMedia = mediaItems.length > 0;

  if (input.primaryMediaAssetId && !hasStagedMedia) {
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

  if (hasStagedMedia) {
    try {
      await updateCatalogProductMedia(
        product.id,
        { productId: product.id, items: mediaItems },
        adminId
      );
    } catch {
      await client.from("catalog_products").delete().eq("id", product.id);
      throw new Error("Failed to link product media. Product was not saved.");
    }
  } else if (input.primaryMediaAssetId) {
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

type ProductMediaRow = {
  id: string;
  product_id: string;
  media_asset_id: string;
  placement: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  is_enabled: boolean;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type MediaAssetRow = {
  id: string;
  url: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
};

function mapMediaRowToDto(
  row: ProductMediaRow,
  assetMap: Map<string, MediaAssetRow>
): AdminProductMediaItemDto {
  const asset = assetMap.get(row.media_asset_id);
  return {
    id: row.id,
    productId: row.product_id,
    mediaAssetId: row.media_asset_id,
    url: asset?.url ?? "",
    mimeType: asset?.mime_type ?? null,
    width: asset?.width ?? null,
    height: asset?.height ?? null,
    sizeBytes: asset?.size_bytes ?? null,
    placement: row.placement as CatalogProductMediaPlacement,
    altText: row.alt_text ?? "",
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
    isEnabled: row.is_enabled,
    settings: row.settings ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

    // Fetch all product media
    const { data: mediaRows } = await client
      .from("catalog_product_media")
      .select("*")
      .eq("product_id", productId)
      .order("placement")
      .order("sort_order")
      .order("created_at");

    let mediaItems: AdminProductMediaItemDto[] = [];
    let existingMediaIds: string[] = [];

    if (mediaRows && mediaRows.length > 0) {
      existingMediaIds = mediaRows.map((m) => m.media_asset_id).filter(Boolean);
      const { data: assets } = await client
        .from("media_assets")
        .select("id,url,mime_type,width,height,size_bytes")
        .in("id", existingMediaIds);

      const assetMap = new Map<string, MediaAssetRow>();
      assets?.forEach((a) => assetMap.set(a.id, a));

      mediaItems = (mediaRows as ProductMediaRow[]).map((m) =>
        mapMediaRowToDto(m, assetMap)
      );

      // Find primary thumbnail for backward compatibility
      const primaryThumb = mediaItems.find(
        (m) => m.placement === "thumbnail" && m.isPrimary && m.isEnabled
      );
      if (primaryThumb) {
        primaryImageUrl = primaryThumb.url;
        primaryMediaAssetId = primaryThumb.mediaAssetId;
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
      mediaItems,
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

    // New row confirmed; now safely remove the previous thumbnail(s).
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

// --- Product Media Management ---

export async function updateCatalogProductMedia(
  productId: string,
  input: CatalogProductMediaFormInput,
  adminId: string
): Promise<void> {
  const client = createSupabaseServiceRoleClient();
  if (!client) throw new Error("Database not available.");

  // Cross-check: input productId must match the route productId.
  if (input.productId !== productId) throw new Error("Product ID mismatch.");

  // Verify product exists and belongs to this admin operation.
  const { data: product, error: productErr } = await client
    .from("catalog_products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();
  if (productErr || !product) throw new Error("Product not found.");

  // Fetch all existing media rows for this product (for scoping and id verification).
  const { data: existingRows, error: existingErr } = await client
    .from("catalog_product_media")
    .select("id")
    .eq("product_id", productId);
  if (existingErr) throw new Error("Failed to load existing media.");

  const existingIdSet = new Set((existingRows ?? []).map((r) => r.id));

  // If clearing all media, delete everything and return.
  if (input.items.length === 0) {
    if (existingIdSet.size > 0) {
      const { error: deleteErr } = await client
        .from("catalog_product_media")
        .delete()
        .eq("product_id", productId);
      if (deleteErr) throw new Error("Failed to clear product media.");
    }
    return;
  }

  // Reject any submitted existing row id that does not belong to this product.
  for (const item of input.items) {
    if (item.id && !existingIdSet.has(item.id)) {
      throw new Error("Submitted media row does not belong to this product.");
    }
  }

  // Batch fetch all referenced media assets.
  const mediaAssetIds = [...new Set(input.items.map((i) => i.mediaAssetId))];
  const { data: assets, error: assetsErr } = await client
    .from("media_assets")
    .select("id,mime_type")
    .in("id", mediaAssetIds);
  if (assetsErr) throw new Error("Failed to validate media assets.");

  const foundIds = new Set((assets ?? []).map((a) => a.id));
  for (const id of mediaAssetIds) {
    if (!foundIds.has(id)) throw new Error("Unknown media asset referenced.");
  }

  const assetMimeMap = new Map<string, string | null>();
  (assets ?? []).forEach((a) => assetMimeMap.set(a.id, a.mime_type));

  // Enforce MIME rules per placement.
  const imageOnlyPlacements: CatalogProductMediaPlacement[] = ["thumbnail", "hero", "bento", "detail"];
  let galleryImageCount = 0;
  let galleryVideoCount = 0;

  for (const item of input.items) {
    const mime = assetMimeMap.get(item.mediaAssetId);
    const isImage = mime?.startsWith("image/") ?? false;
    const isVideo = mime?.startsWith("video/") ?? false;

    if (imageOnlyPlacements.includes(item.placement)) {
      if (!isImage) throw new Error(`Placement "${item.placement}" requires an image.`);
    } else if (item.placement === "gallery") {
      if (!isImage && !isVideo) throw new Error("Gallery media must be an image or video.");
      if (isVideo && item.isEnabled) {
        galleryVideoCount++;
        if (galleryVideoCount > PRODUCT_MEDIA_LIMITS.galleryVideos) {
          throw new Error("Only one enabled gallery video is allowed.");
        }
      }
      if (isImage && item.isEnabled) {
        galleryImageCount++;
        if (galleryImageCount > PRODUCT_MEDIA_LIMITS.galleryImages) {
          throw new Error(`Only ${PRODUCT_MEDIA_LIMITS.galleryImages} enabled gallery images are allowed.`);
        }
      }
    }
  }

  // Update existing rows scoped to both id and product_id.
  for (const item of input.items) {
    if (item.id && existingIdSet.has(item.id)) {
      const { error: updateErr } = await client
        .from("catalog_product_media")
        .update({
          media_asset_id: item.mediaAssetId,
          placement: item.placement,
          alt_text: item.altText || null,
          sort_order: item.sortOrder,
          is_primary: item.isPrimary,
          is_enabled: item.isEnabled,
          updated_by: adminId,
        })
        .eq("id", item.id)
        .eq("product_id", productId); // scoped to product
      if (updateErr) throw new Error("Failed to update media row.");
    }
  }

  // Insert new rows (those without an existing id).
  const newItems = input.items.filter((i) => !i.id || !existingIdSet.has(i.id));
  if (newItems.length > 0) {
    const { error: insertErr } = await client
      .from("catalog_product_media")
      .insert(
        newItems.map((i) => ({
          product_id: productId,
          media_asset_id: i.mediaAssetId,
          placement: i.placement,
          alt_text: i.altText || null,
          sort_order: i.sortOrder,
          is_primary: i.isPrimary,
          is_enabled: i.isEnabled,
          settings: {},
          updated_by: adminId,
        }))
      );
    if (insertErr) throw new Error("Failed to add new media items.");
  }

  // Delete removed rows only after successful updates/inserts, scoped to product.
  const keepIds = new Set(input.items.map((i) => i.id).filter((id): id is string => !!id));
  const deleteIds = [...existingIdSet].filter((id) => !keepIds.has(id));
  if (deleteIds.length > 0) {
    const { error: deleteErr } = await client
      .from("catalog_product_media")
      .delete()
      .in("id", deleteIds)
      .eq("product_id", productId); // scoped to product
    if (deleteErr) throw new Error("Failed to remove media items.");
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

// --- Public Storefront Reads ---

const FALLBACK_PRODUCT_IMAGE = "/images/products/drone.png";

const PUBLIC_PRODUCT_LIST_COLUMNS =
  "id,name,slug,brand,price_cents,compare_at_price_cents,stock_quantity,category_id,is_featured,is_popular,is_new_arrival,created_at";

const PUBLIC_PRODUCT_DETAIL_COLUMNS =
  "id,name,slug,brand,price_cents,compare_at_price_cents,stock_quantity,category_id,is_featured,is_popular,is_new_arrival,created_at,description,short_description,feature_bullets,shipping_policy";

type PublicProductListRow = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  stock_quantity: number;
  category_id: string | null;
  is_featured: boolean;
  is_popular: boolean;
  is_new_arrival: boolean;
  created_at: string;
};

type PublicProductDetailRow = PublicProductListRow & {
  description: string | null;
  short_description: string | null;
  feature_bullets: unknown;
  shipping_policy: string | null;
};

const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  priceRange: { min: 0, max: 10000 },
  brands: [],
  stockStatuses: [
    { label: "On sale", value: "on_sale", count: 0 },
    { label: "In stock", value: "in_stock", count: 0 },
    { label: "On backorder", value: "backorder", count: 0 },
  ],
};

// Promises shown on PDP until a dedicated DB column exists.
const DEFAULT_PRODUCT_PROMISES = [
  { icon: "Percent", title: "Additional", subtitle: "prepaid Discount" },
  { icon: "RefreshCw", title: "72 hours", subtitle: "Replacement" },
  { icon: "ShieldCheck", title: "6 months", subtitle: "Warranty" },
  { icon: "Truck", title: "Free", subtitle: "Shipping" },
  { icon: "MapPin", title: "20,000+", subtitle: "Pincodes" },
  { icon: "PackageCheck", title: "ATS: Amazon", subtitle: "Delivery Partner" },
];

function computeDiscount(priceCents: number, compareCents: number | null): number {
  if (!compareCents || compareCents <= priceCents) return 0;
  return Math.round((1 - priceCents / compareCents) * 100);
}

function mapPublicRowToProduct(
  row: PublicProductListRow,
  categoryName: string,
  thumbnailUrl: string
): Product {
  const price = row.price_cents / 100;
  const originalPrice = row.compare_at_price_cents
    ? row.compare_at_price_cents / 100
    : price;
  return {
    id: row.id,
    name: row.name,
    category: categoryName,
    price,
    originalPrice,
    discount: computeDiscount(row.price_cents, row.compare_at_price_cents),
    image: thumbnailUrl || FALLBACK_PRODUCT_IMAGE,
    slug: row.slug,
  };
}

function parseFeatureBullets(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is string => typeof v === "string");
}

async function batchFetchPublicThumbnails(
  client: ServerSupabaseClient,
  productIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (productIds.length === 0) return map;

  const { data: mediaRows } = await client
    .from("catalog_product_media")
    .select("product_id,media_asset_id")
    .in("product_id", productIds)
    .eq("placement", "thumbnail")
    .eq("is_primary", true)
    .eq("is_enabled", true);

  if (!mediaRows || mediaRows.length === 0) return map;

  const assetIds = mediaRows.map((r) => r.media_asset_id);
  const { data: assets } = await client
    .from("media_assets")
    .select("id,url")
    .in("id", assetIds)
    .eq("is_public", true);

  const assetUrlMap = new Map<string, string>();
  assets?.forEach((a) => assetUrlMap.set(a.id, a.url));

  mediaRows.forEach((r) => {
    const url = assetUrlMap.get(r.media_asset_id);
    if (url) map.set(r.product_id, url);
  });

  return map;
}

async function batchFetchCategoryNamesPublic(
  client: ServerSupabaseClient,
  categoryIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (categoryIds.length === 0) return map;
  const { data } = await client
    .from("catalog_categories")
    .select("id,name")
    .in("id", categoryIds);
  data?.forEach((c) => map.set(c.id, c.name));
  return map;
}

export async function readPublicCategoryBySlug(
  slug: string
): Promise<{ id: string; name: string; slug: string; description: string } | null> {
  const client = createSupabaseAnonServerClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("catalog_categories")
      .select("id,name,slug,description")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description ?? "",
    };
  } catch {
    return null;
  }
}

export async function readPublicProductList(
  params: GetProductsParams
): Promise<PaginatedProducts> {
  const client = createSupabaseAnonServerClient();
  if (!client) return { data: [], total: 0, totalPages: 1, currentPage: 1 };

  try {
    const PAGE_SIZE = 12;
    const page = Math.max(1, params.page ?? 1);

    // Resolve category slug to ID and name when provided.
    let categoryId: string | null = null;
    let singleCategoryName: string | null = null;

    if (params.categorySlug) {
      const { data: cat } = await client
        .from("catalog_categories")
        .select("id,name")
        .eq("slug", params.categorySlug)
        .eq("is_active", true)
        .maybeSingle();
      if (!cat) return { data: [], total: 0, totalPages: 1, currentPage: page };
      categoryId = cat.id;
      singleCategoryName = cat.name;
    }

    let query = client
      .from("catalog_products")
      .select(PUBLIC_PRODUCT_LIST_COLUMNS, { count: "exact" })
      .eq("status", "active");

    if (categoryId) query = query.eq("category_id", categoryId);
    if (params.minPrice) query = query.gte("price_cents", params.minPrice * 100);
    if (params.maxPrice) query = query.lte("price_cents", params.maxPrice * 100);
    if (params.brand) query = query.eq("brand", params.brand);

    if (params.stockStatus === "in_stock") {
      query = query.gt("stock_quantity", 0);
    } else if (params.stockStatus === "on_sale") {
      query = query.not("compare_at_price_cents", "is", null);
    } else if (params.stockStatus === "backorder") {
      return { data: [], total: 0, totalPages: 1, currentPage: page };
    }
    // "backorder" has no dedicated column yet, so the filter returns no rows.

    switch (params.sort) {
      case "price-asc":
        query = query.order("price_cents", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price_cents", { ascending: false });
        break;
      case "latest":
        query = query.order("created_at", { ascending: false });
        break;
      case "popularity":
      case "rating":
        query = query
          .order("is_popular", { ascending: false })
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false });
        break;
      default:
        query = query
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false });
    }

    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, count, error } = await query;
    if (error || !data) return { data: [], total: 0, totalPages: 1, currentPage: page };

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const rows = data as PublicProductListRow[];
    const productIds = rows.map((r) => r.id);

    const [thumbnailMap, catNameMap] = await Promise.all([
      batchFetchPublicThumbnails(client, productIds),
      singleCategoryName
        ? Promise.resolve(new Map<string, string>())
        : batchFetchCategoryNamesPublic(
            client,
            [...new Set(rows.map((r) => r.category_id).filter(Boolean))] as string[]
          ),
    ]);

    const products = rows.map((row) => {
      const catName =
        singleCategoryName ??
        (row.category_id ? (catNameMap.get(row.category_id) ?? "Uncategorized") : "Uncategorized");
      return mapPublicRowToProduct(row, catName, thumbnailMap.get(row.id) ?? FALLBACK_PRODUCT_IMAGE);
    });

    return { data: products, total, totalPages, currentPage: page };
  } catch {
    return { data: [], total: 0, totalPages: 1, currentPage: params.page ?? 1 };
  }
}

export async function readPublicFilterOptions(
  categorySlug?: string
): Promise<FilterOptions> {
  const client = createSupabaseAnonServerClient();
  if (!client) return DEFAULT_FILTER_OPTIONS;

  try {
    let categoryId: string | null = null;
    if (categorySlug) {
      const { data: cat } = await client
        .from("catalog_categories")
        .select("id")
        .eq("slug", categorySlug)
        .eq("is_active", true)
        .maybeSingle();
      categoryId = cat?.id ?? null;
    }

    let query = client
      .from("catalog_products")
      .select("price_cents,compare_at_price_cents,stock_quantity,brand")
      .eq("status", "active");

    if (categoryId) query = query.eq("category_id", categoryId);

    const { data, error } = await query;
    if (error || !data || data.length === 0) return DEFAULT_FILTER_OPTIONS;

    const prices = data.map((r) => r.price_cents).filter((p) => p != null);
    const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices) / 100) : 0;
    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices) / 100) : 10000;

    const brandCounts = new Map<string, number>();
    data.forEach((r) => {
      if (r.brand) brandCounts.set(r.brand, (brandCounts.get(r.brand) ?? 0) + 1);
    });
    const brands = [...brandCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const inStockCount = data.filter((r) => (r.stock_quantity ?? 0) > 0).length;
    const onSaleCount = data.filter(
      (r) => r.compare_at_price_cents != null && r.compare_at_price_cents > r.price_cents
    ).length;

    return {
      priceRange: { min: minPrice, max: maxPrice },
      brands,
      stockStatuses: [
        { label: "On sale", value: "on_sale", count: onSaleCount },
        { label: "In stock", value: "in_stock", count: inStockCount },
        { label: "On backorder", value: "backorder", count: 0 },
      ],
    };
  } catch {
    return DEFAULT_FILTER_OPTIONS;
  }
}

export async function readPublicTopRatedProducts(): Promise<Product[]> {
  const client = createSupabaseAnonServerClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("catalog_products")
      .select(PUBLIC_PRODUCT_LIST_COLUMNS)
      .eq("status", "active")
      .order("is_popular", { ascending: false })
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3);

    if (error || !data || data.length === 0) return [];

    const rows = data as PublicProductListRow[];
    const [thumbnailMap, catNameMap] = await Promise.all([
      batchFetchPublicThumbnails(client, rows.map((r) => r.id)),
      batchFetchCategoryNamesPublic(
        client,
        [...new Set(rows.map((r) => r.category_id).filter(Boolean))] as string[]
      ),
    ]);

    return rows.map((row) => {
      const catName = row.category_id ? (catNameMap.get(row.category_id) ?? "Uncategorized") : "Uncategorized";
      return mapPublicRowToProduct(row, catName, thumbnailMap.get(row.id) ?? FALLBACK_PRODUCT_IMAGE);
    });
  } catch {
    return [];
  }
}

export async function readPublicProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  const client = createSupabaseAnonServerClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("catalog_products")
      .select(PUBLIC_PRODUCT_DETAIL_COLUMNS)
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (error || !data) return null;

    const row = data as PublicProductDetailRow;

    const [catNameMap, thumbnailMap, galleryResult, bentoResult] = await Promise.all([
      row.category_id
        ? batchFetchCategoryNamesPublic(client, [row.category_id])
        : Promise.resolve(new Map<string, string>()),
      batchFetchPublicThumbnails(client, [row.id]),
      client
        .from("catalog_product_media")
        .select("media_asset_id,sort_order")
        .eq("product_id", row.id)
        .eq("placement", "gallery")
        .eq("is_enabled", true)
        .order("sort_order", { ascending: true }),
      client
        .from("catalog_product_media")
        .select("media_asset_id,sort_order")
        .eq("product_id", row.id)
        .eq("placement", "bento")
        .eq("is_enabled", true)
        .order("sort_order", { ascending: true }),
    ]);

    const categoryName = row.category_id
      ? (catNameMap.get(row.category_id) ?? "Uncategorized")
      : "Uncategorized";
    const thumbnailUrl = thumbnailMap.get(row.id) ?? FALLBACK_PRODUCT_IMAGE;

    const galleryRows = galleryResult.data ?? [];
    const bentoRows = bentoResult.data ?? [];

    // Batch fetch all media assets for gallery and bento.
    const allMediaAssetIds = [
      ...new Set([
        ...galleryRows.map((r) => r.media_asset_id),
        ...bentoRows.map((r) => r.media_asset_id),
      ]),
    ];

    const assetMap = new Map<string, { url: string; mime_type: string | null }>();
    if (allMediaAssetIds.length > 0) {
      const { data: assets } = await client
        .from("media_assets")
        .select("id,url,mime_type")
        .in("id", allMediaAssetIds)
        .eq("is_public", true);
      assets?.forEach((a) => assetMap.set(a.id, { url: a.url, mime_type: a.mime_type }));
    }

    // Build gallery media array; fall back to thumbnail if no gallery rows.
    const media: MediaItem[] = galleryRows
      .map((r) => {
        const asset = assetMap.get(r.media_asset_id);
        if (!asset) return null;
        const isVideo = asset.mime_type?.startsWith("video/") ?? false;
        return { id: r.media_asset_id, type: isVideo ? "video" : "image", src: asset.url } as MediaItem;
      })
      .filter((m): m is MediaItem => m !== null);

    if (media.length === 0) {
      media.push({ id: `${row.id}-thumb`, type: "image", src: thumbnailUrl });
    }

    const bentoImages = bentoRows
      .map((r) => assetMap.get(r.media_asset_id)?.url)
      .filter((url): url is string => !!url);

    const featureBullets = parseFeatureBullets(row.feature_bullets);
    const description = row.description ?? row.short_description ?? "";

    const baseProduct = mapPublicRowToProduct(row, categoryName, thumbnailUrl);

    return {
      ...baseProduct,
      brand: row.brand,
      description,
      media,
      features: featureBullets.length > 0 ? featureBullets : undefined,
      featuresAndCompatibility: description || undefined,
      bentoImages: bentoImages.length >= 5 ? bentoImages.slice(0, 5) : undefined,
      shippingPolicy: row.shipping_policy ?? undefined,
      promises: DEFAULT_PRODUCT_PROMISES,
      // reviews omitted — no review schema exists yet
    };
  } catch {
    return null;
  }
}

export async function readPublicAllProducts(): Promise<Product[]> {
  const client = createSupabaseAnonServerClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("catalog_products")
      .select(PUBLIC_PRODUCT_LIST_COLUMNS)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) return [];

    const rows = data as PublicProductListRow[];
    const [thumbnailMap, catNameMap] = await Promise.all([
      batchFetchPublicThumbnails(client, rows.map((r) => r.id)),
      batchFetchCategoryNamesPublic(
        client,
        [...new Set(rows.map((r) => r.category_id).filter(Boolean))] as string[]
      ),
    ]);

    return rows.map((row) => {
      const catName = row.category_id ? (catNameMap.get(row.category_id) ?? "Uncategorized") : "Uncategorized";
      return mapPublicRowToProduct(row, catName, thumbnailMap.get(row.id) ?? FALLBACK_PRODUCT_IMAGE);
    });
  } catch {
    return [];
  }
}
