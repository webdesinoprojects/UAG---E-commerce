import { Product } from "./components/product-card";

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
