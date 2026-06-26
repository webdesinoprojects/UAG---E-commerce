import "server-only";

import { z } from "zod";
import {
  PRODUCT_MEDIA_LIMITS,
  type CatalogCategoryDto,
} from "@/features/catalog/types";

const nullableUuidSchema = z
  .union([z.string().uuid(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => (value ? value : null));

export const categorySlugSchema = z
  .string()
  .trim()
  .min(2, "Use at least 2 characters.")
  .max(80, "Use at most 80 characters.")
  .regex(/^[a-z0-9][a-z0-9-]*$/, "Use lowercase letters, numbers, and hyphens.");

export const catalogCategoryInputSchema = z.object({
  id: nullableUuidSchema,
  parentId: nullableUuidSchema,
  name: z.string().trim().min(2, "Name is required.").max(80),
  slug: categorySlugSchema,
  description: z.string().trim().max(500).default(""),
  mediaAssetId: nullableUuidSchema,
  bannerMediaAssetId: nullableUuidSchema,
  sortOrder: z.coerce.number().int().min(0).max(10_000),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  seoTitle: z.string().trim().max(80).default(""),
  seoDescription: z.string().trim().max(180).default(""),
});

export type CatalogCategoryInput = z.infer<typeof catalogCategoryInputSchema>;

export function parseCatalogCategoryForm(formData: FormData) {
  return catalogCategoryInputSchema.safeParse({
    id: formData.get("id"),
    parentId: formData.get("parentId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    mediaAssetId: formData.get("mediaAssetId"),
    bannerMediaAssetId: formData.get("bannerMediaAssetId"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive") === "true",
    isFeatured: formData.get("isFeatured") === "true",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
}

export type CatalogCategoryRow = {
  banner_media_asset_id: string | null;
  created_at: string;
  description: string | null;
  id: string;
  is_active: boolean;
  is_featured: boolean;
  media_asset_id: string | null;
  name: string;
  parent_id: string | null;
  seo_description: string | null;
  seo_title: string | null;
  slug: string;
  sort_order: number;
  updated_at: string;
};

export function mapCatalogCategoryRowToDto(
  row: CatalogCategoryRow,
  mediaUrls: Map<string, string>,
  productCount: number
): CatalogCategoryDto {
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    mediaAssetId: row.media_asset_id,
    mediaUrl: row.media_asset_id ? mediaUrls.get(row.media_asset_id) ?? null : null,
    bannerMediaAssetId: row.banner_media_asset_id,
    bannerMediaUrl: row.banner_media_asset_id
      ? mediaUrls.get(row.banner_media_asset_id) ?? null
      : null,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    productCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Product Create ───────────────────────────────────────────────────────────

// Strict rupee→paise converters used as z.preprocess functions.
// Invalid input (NaN, Infinity, non-numeric strings) passes through as-is so
// the downstream z.number() validator rejects it with a user-visible message.
function strictRupeesToPaise(raw: unknown): unknown {
  if (typeof raw !== "string" && typeof raw !== "number") return raw;
  const str = String(raw).trim();
  if (str === "") return undefined; // triggers required_error
  const n = Number(str);
  if (!isFinite(n)) return str; // NaN / Infinity → type error from z.number()
  return Math.round(n * 100);
}

function strictNullableRupeesToPaise(raw: unknown): unknown {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string" && typeof raw !== "number") return raw;
  const str = String(raw).trim();
  if (str === "") return null; // empty → null is valid for optional compare price
  const n = Number(str);
  if (!isFinite(n)) return str; // NaN / Infinity → type error from z.number()
  return Math.round(n * 100);
}

const DEFAULT_BRAND = "UAG Urbn Armour Gear";

export const catalogProductCreateInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200, "Name too long."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters.")
    .max(100, "Slug too long.")
    .regex(/^[a-z0-9][a-z0-9-]*$/, "Use lowercase letters, numbers, and hyphens only."),
  sku: z
    .union([z.string().trim().min(1).max(100), z.literal(""), z.null(), z.undefined()])
    .transform((v): string | null =>
      v && typeof v === "string" && v.trim() ? v.trim() : null
    ),
  categoryId: nullableUuidSchema,
  brand: z
    .string()
    .trim()
    .max(100, "Brand too long.")
    .transform((v) => v || DEFAULT_BRAND),
  shortDescription: z.string().trim().max(500).default(""),
  description: z.string().trim().max(5000).default(""),
  priceCents: z.preprocess(
    strictRupeesToPaise,
    z
      .number({ error: "Enter a valid price in ₹ (e.g., 1199)." })
      .int()
      .min(0, "Price must be non-negative.")
      .max(100_000_000, "Price too large.")
  ),
  compareAtPriceCents: z.preprocess(
    strictNullableRupeesToPaise,
    z
      .number({ error: "Enter a valid compare price in ₹." })
      .int()
      .min(0, "Compare price must be non-negative.")
      .max(100_000_000)
      .nullable()
  ),
  currency: z
    .string()
    .trim()
    .length(3, "Currency must be 3 characters.")
    .regex(/^[A-Z]{3}$/, "Currency must be 3 uppercase letters (e.g., INR).")
    .default("INR"),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative.").max(1_000_000).default(0),
  lowStockThreshold: z.coerce
    .number()
    .int()
    .min(0, "Threshold cannot be negative.")
    .max(10_000)
    .default(5),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isPopular: z.boolean(),
  seoTitle: z.string().trim().max(80).default(""),
  seoDescription: z.string().trim().max(180).default(""),
  primaryMediaAssetId: nullableUuidSchema,
});

export type CatalogProductCreateInput = z.infer<typeof catalogProductCreateInputSchema>;

export function parseCatalogProductCreateForm(formData: FormData) {
  return catalogProductCreateInputSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    brand: (formData.get("brand") ?? "").toString().trim() || DEFAULT_BRAND,
    shortDescription: formData.get("shortDescription") ?? "",
    description: formData.get("description") ?? "",
    priceCents: formData.get("priceRupees"),
    compareAtPriceCents: formData.get("compareAtPriceRupees"),
    currency: formData.get("currency") || "INR",
    stockQuantity: formData.get("stockQuantity"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    status: formData.get("status"),
    isFeatured: formData.get("isFeatured") === "true",
    isNewArrival: formData.get("isNewArrival") === "true",
    isPopular: formData.get("isPopular") === "true",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    primaryMediaAssetId: formData.get("primaryMediaAssetId"),
  });
}

// Row schema: blank id normalizes to undefined; non-thumbnail isPrimary is forced false.
const productMediaItemSchema = z
  .object({
    id: z
      .union([z.string().uuid(), z.literal(""), z.null(), z.undefined()])
      .transform((v): string | undefined =>
        v && typeof v === "string" && v !== "" ? v : undefined
      ),
    mediaAssetId: z.string().uuid("Each row must reference a valid media asset."),
    placement: z.enum(["thumbnail", "gallery", "hero", "bento", "detail"], {
      error: "Invalid placement.",
    }),
    altText: z.string().max(200).default(""),
    sortOrder: z.coerce.number().int().min(0).max(10000),
    isPrimary: z.boolean(),
    isEnabled: z.boolean(),
  })
  .transform((item) => ({
    ...item,
    // Non-thumbnail rows must never be submitted as primary.
    isPrimary: item.placement === "thumbnail" ? item.isPrimary : false,
  }));

const productMediaItemsPayloadSchema = z.object({
  mediaCount: z
    .number()
    .int()
    .min(0)
    .max(
      PRODUCT_MEDIA_LIMITS.total,
      `Product media is limited to ${PRODUCT_MEDIA_LIMITS.total} rows.`
    ),
  items: z
    .array(productMediaItemSchema)
    .max(
      PRODUCT_MEDIA_LIMITS.total,
      `Maximum ${PRODUCT_MEDIA_LIMITS.total} media items.`
    ),
});

type ProductMediaItemsPayload = z.infer<typeof productMediaItemsPayloadSchema>;

function validateProductMediaItems(
  data: ProductMediaItemsPayload,
  ctx: z.RefinementCtx
) {
  const { items } = data;
  if (items.length === 0) return; // zero items = intentional clear

  const enabledItems = items.filter((i) => i.isEnabled);
  const thumbnailCount = enabledItems.filter((i) => i.placement === "thumbnail").length;
  const galleryCount = enabledItems.filter((i) => i.placement === "gallery").length;
  const heroCount = enabledItems.filter((i) => i.placement === "hero").length;
  const bentoCount = enabledItems.filter((i) => i.placement === "bento").length;
  const detailCount = enabledItems.filter((i) => i.placement === "detail").length;

  if (thumbnailCount > PRODUCT_MEDIA_LIMITS.thumbnail) {
    ctx.addIssue({
      code: "custom",
      message: `Only ${PRODUCT_MEDIA_LIMITS.thumbnail} enabled thumbnail is allowed.`,
      path: ["items"],
    });
  }

  if (galleryCount > PRODUCT_MEDIA_LIMITS.galleryTotal) {
    ctx.addIssue({
      code: "custom",
      message: `Gallery allows ${PRODUCT_MEDIA_LIMITS.galleryImages} enabled images and ${PRODUCT_MEDIA_LIMITS.galleryVideos} enabled video.`,
      path: ["items"],
    });
  }

  if (heroCount > PRODUCT_MEDIA_LIMITS.hero) {
    ctx.addIssue({
      code: "custom",
      message: "Hero media is not rendered by the current storefront yet.",
      path: ["items"],
    });
  }

  if (bentoCount > PRODUCT_MEDIA_LIMITS.bento) {
    ctx.addIssue({
      code: "custom",
      message: `Bento allows up to ${PRODUCT_MEDIA_LIMITS.bento} enabled images.`,
      path: ["items"],
    });
  }

  if (detailCount > PRODUCT_MEDIA_LIMITS.detail) {
    ctx.addIssue({
      code: "custom",
      message: "Detail media is not rendered by the current storefront yet.",
      path: ["items"],
    });
  }

  // Reject duplicate row ids
  const rowIds = items.map((i) => i.id).filter((v): v is string => v !== undefined);
  if (new Set(rowIds).size !== rowIds.length) {
    ctx.addIssue({ code: "custom", message: "Duplicate row IDs in submission.", path: ["items"] });
  }

  // If any enabled items exist, require exactly one enabled primary thumbnail.
  const hasEnabled = items.some((i) => i.isEnabled);
  if (hasEnabled) {
    const enabledPrimaries = items.filter(
      (i) => i.placement === "thumbnail" && i.isPrimary && i.isEnabled
    );
    if (enabledPrimaries.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Exactly one enabled primary thumbnail is required.",
        path: ["items"],
      });
    } else if (enabledPrimaries.length > 1) {
      ctx.addIssue({
        code: "custom",
        message: "Only one thumbnail may be marked as primary.",
        path: ["items"],
      });
    }
  }

  // Reject duplicate mediaAssetId + placement + sortOrder combinations.
  const comboKeys = new Set<string>();
  for (const item of items) {
    const key = `${item.mediaAssetId}:${item.placement}:${item.sortOrder}`;
    if (comboKeys.has(key)) {
      ctx.addIssue({
        code: "custom",
        message: "Duplicate media asset with the same placement and sort order.",
        path: ["items"],
      });
      break;
    }
    comboKeys.add(key);
  }
}

const catalogProductDraftMediaFormSchema = productMediaItemsPayloadSchema
  .superRefine(validateProductMediaItems)
  .transform(({ items }) => ({ items }));

const catalogProductMediaFormSchema = productMediaItemsPayloadSchema
  .extend({
    productId: z.string().uuid("Invalid product ID."),
  })
  .superRefine(validateProductMediaItems)
  .transform(({ productId, items }) => ({ productId, items }));

export type CatalogProductMediaFormInput = z.infer<typeof catalogProductMediaFormSchema>;
export type CatalogProductDraftMediaFormInput = z.infer<
  typeof catalogProductDraftMediaFormSchema
>;

function readProductMediaFormPayload(formData: FormData) {
  const rawCount = formData.get("mediaCount");
  const count = rawCount ? parseInt(String(rawCount), 10) : 0;
  const countClamped = Math.max(
    0,
    Math.min(PRODUCT_MEDIA_LIMITS.total, isNaN(count) ? 0 : count)
  );

  const rawItems = [];
  for (let i = 0; i < countClamped; i++) {
    rawItems.push({
      id: formData.get(`media.${i}.id`)?.toString() ?? "",
      mediaAssetId: formData.get(`media.${i}.mediaAssetId`)?.toString() ?? "",
      placement: formData.get(`media.${i}.placement`)?.toString() ?? "",
      altText: formData.get(`media.${i}.altText`)?.toString() ?? "",
      sortOrder: formData.get(`media.${i}.sortOrder`)?.toString() ?? "0",
      isPrimary: formData.get(`media.${i}.isPrimary`) === "true",
      isEnabled: formData.get(`media.${i}.isEnabled`) === "true",
    });
  }

  return {
    mediaCount: isNaN(count) ? 0 : count,
    items: rawItems,
  };
}

export function parseCatalogProductDraftMediaForm(formData: FormData) {
  return catalogProductDraftMediaFormSchema.safeParse(
    readProductMediaFormPayload(formData)
  );
}

export function parseCatalogProductMediaForm(formData: FormData) {
  const payload = readProductMediaFormPayload(formData);

  return catalogProductMediaFormSchema.safeParse({
    productId: formData.get("productId"),
    mediaCount: payload.mediaCount,
    items: payload.items,
  });
}
