import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  readPublicCategoryBySlug,
  readPublicCatalogCategories,
  readPublicProductList,
  readPublicFilterOptions,
  readPublicTopRatedProducts,
  readPublicProductBySlug,
  readPublicAllProducts,
  searchPublicProducts,
} from "@/server/repositories/catalog-repository";
import type {
  Category,
  CatalogCategoryDto,
  GetProductsParams,
  PaginatedProducts,
  FilterOptions,
  ProductDetail,
} from "./types";
import type { Product } from "./components/product-card";

export const CATALOG_CATEGORIES_CACHE_TAG = "catalog-categories";
export const CATALOG_PRODUCTS_CACHE_TAG = "catalog-products";

export async function getCatalogCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_CATEGORIES_CACHE_TAG);

  return readPublicCatalogCategories();
}

export async function getCatalogCategoryBySlug(slug: string): Promise<Category | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_CATEGORIES_CACHE_TAG, `category-${slug}`);

  return readPublicCategoryBySlug(slug);
}

export async function getFeaturedCatalogCategories(): Promise<
  CatalogCategoryDto[]
> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_CATEGORIES_CACHE_TAG, CATALOG_PRODUCTS_CACHE_TAG);

  const categories = await readPublicCatalogCategories();
  return categories.filter(
    (category) => category.isActive && category.isFeatured
  );
}

export async function getProducts(params: GetProductsParams): Promise<PaginatedProducts> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_PRODUCTS_CACHE_TAG, `category-${params.categorySlug ?? "all"}`);

  return readPublicProductList(params);
}

export async function getFilterOptions(categorySlug?: string): Promise<FilterOptions> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_CATEGORIES_CACHE_TAG, CATALOG_PRODUCTS_CACHE_TAG);

  return readPublicFilterOptions(categorySlug);
}

export async function getTopRatedProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_PRODUCTS_CACHE_TAG, "top-rated");

  return readPublicTopRatedProducts();
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_PRODUCTS_CACHE_TAG, `product-${slug}`);

  return readPublicProductBySlug(slug);
}

export async function getAllProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_PRODUCTS_CACHE_TAG, "all");

  return readPublicAllProducts();
}

export async function searchProducts(query: string): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_PRODUCTS_CACHE_TAG, `search-${query.trim().toLowerCase()}`);

  return searchPublicProducts(query);
}
