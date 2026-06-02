import React from "react";
import { notFound } from "next/navigation";
import { getProducts, getFilterOptions, getTopRatedProducts } from "@/features/catalog/queries";
import { ClpLayout } from "@/features/catalog/components/clp-layout";
import { GetProductsParams } from "@/features/catalog/types";

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  return (
    <React.Suspense fallback={
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white dark:bg-[#050505]">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Loading Catalog...</p>
      </div>
    }>
      <CategoryContent params={params} searchParams={searchParams} />
    </React.Suspense>
  );
}

async function CategoryContent({ 
  params, 
  searchParams 
}: CategoryPageProps) {
  const { categorySlug } = await params;
  const search = await searchParams;

  // Normalize category name for display
  const categoryName = categorySlug === "earbuds" 
    ? "Earbuds Or Airdopes ENC" 
    : categorySlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    
  const category = {
    id: categorySlug,
    name: categoryName,
    slug: categorySlug,
  };

  // Build query params for the mock backend
  const queryParams: GetProductsParams = {
    categorySlug: category.slug,
    page: search.page ? Number(search.page) : 1,
    sort: typeof search.sort === "string" ? search.sort : undefined,
    minPrice: search.minPrice ? Number(search.minPrice) : undefined,
    maxPrice: search.maxPrice ? Number(search.maxPrice) : undefined,
    brand: typeof search.brand === "string" ? search.brand : undefined,
    stockStatus: typeof search.stockStatus === "string" ? search.stockStatus : undefined,
  };

  // Fetch data in parallel for optimal performance
  const [paginatedProducts, filterOptions, topRatedProducts] = await Promise.all([
    getProducts(queryParams),
    getFilterOptions(category.slug),
    getTopRatedProducts()
  ]);

  const layoutCols = search.layout ? Number(search.layout) : 3;

  return (
    <ClpLayout 
      category={category}
      filterOptions={filterOptions}
      topRatedProducts={topRatedProducts}
      paginatedProducts={paginatedProducts}
      layoutCols={layoutCols}
    />
  );
}
