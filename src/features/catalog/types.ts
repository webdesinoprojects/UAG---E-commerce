import { Product } from "./components/product-card";

export type ProductStatus = "draft" | "active" | "archived";

export interface AdminProductListItemDto {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  categoryId: string | null;
  categoryName: string | null;
  brand: string;
  status: ProductStatus;
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isPopular: boolean;
  primaryImageUrl: string | null;
  primaryMediaAssetId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductFormCategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface AdminProductDetailDto extends AdminProductListItemDto {
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  mediaItems: AdminProductMediaItemDto[];
}

export type CatalogProductMediaPlacement =
  | "thumbnail"
  | "gallery"
  | "hero"
  | "bento"
  | "detail";

export const PRODUCT_MEDIA_LIMITS = {
  total: 12,
  thumbnail: 1,
  galleryImages: 5,
  galleryVideos: 1,
  galleryTotal: 6,
  hero: 0,
  bento: 5,
  detail: 0,
} as const;

export interface AdminProductMediaItemDto {
  id: string;
  productId: string;
  mediaAssetId: string;
  url: string;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  placement: CatalogProductMediaPlacement;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  isEnabled: boolean;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsParams {
  categorySlug?: string;
  page?: number;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  stockStatus?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CatalogCategoryDto {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string;
  mediaAssetId: string | null;
  mediaUrl: string | null;
  bannerMediaAssetId: string | null;
  bannerMediaUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogCategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface FilterOptions {
  priceRange: { min: number; max: number };
  brands: { name: string; count: number }[];
  stockStatuses: { label: string; value: string; count: number }[];
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
}

export interface Review {
  id: string;
  author: string;
  isVerified: boolean;
  rating: number;
  date: string;
  title: string;
  content: string;
}

export interface ProductDetail extends Product {
  description: string;
  brand: string;
  media: MediaItem[];
  features?: string[];
  featuresAndCompatibility?: string;
  promises?: {
    icon: string;
    title: string;
    subtitle: string;
  }[];
  bentoImages?: string[];
  detailedDescription?: {
    summary: string;
    specifications: { label: string; value: string }[];
    usp: { label: string; value: string }[];
  };
  shippingPolicy?: string;
  reviews?: {
    stats: {
      average: number;
      totalCount: number;
      distribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
      };
    };
    list: Review[];
  };
}
