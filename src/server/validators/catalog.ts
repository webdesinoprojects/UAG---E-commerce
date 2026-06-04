import "server-only";

import { z } from "zod";
import type { CatalogCategoryDto } from "@/features/catalog/types";

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
