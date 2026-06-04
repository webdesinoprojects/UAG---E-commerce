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
