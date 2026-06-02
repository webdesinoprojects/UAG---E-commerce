import React from "react";
import { CategoryHero } from "./category-hero";
import { ClpSidebar } from "./clp-sidebar";
import { ClpTopbar } from "./clp-topbar";
import { ClpPagination } from "./clp-pagination";
import ProductCard, { Product } from "./product-card";
import { Category, FilterOptions, PaginatedProducts } from "../types";
import { cn } from "@/lib/utils";

interface ClpLayoutProps {
  category: Category;
  filterOptions: FilterOptions;
  topRatedProducts: Product[];
  paginatedProducts: PaginatedProducts;
  layoutCols: number;
}

export function ClpLayout({
  category,
  filterOptions,
  topRatedProducts,
  paginatedProducts,
  layoutCols
}: ClpLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      {/* 1. Category Hero Banner */}
      <CategoryHero category={category} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          
          {/* 2. Sidebar Filters (Desktop Only) */}
          <React.Suspense fallback={<div className="hidden md:block w-full md:w-64 shrink-0 animate-pulse bg-zinc-100 dark:bg-zinc-800 h-96 rounded-2xl"></div>}>
            <ClpSidebar filterOptions={filterOptions} topRatedProducts={topRatedProducts} />
          </React.Suspense>

          {/* 3. Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            
            <React.Suspense fallback={<div className="h-14 w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg mb-6"></div>}>
              <ClpTopbar 
                categoryName={category.name} 
                totalProducts={paginatedProducts.total}
                currentPage={paginatedProducts.currentPage}
                filterOptions={filterOptions}
                topRatedProducts={topRatedProducts}
              />
            </React.Suspense>

            {/* Product Grid */}
            {paginatedProducts.data.length > 0 ? (
              <div 
                className={cn(
                  "grid gap-4 sm:gap-6",
                  layoutCols === 2 && "grid-cols-2",
                  layoutCols === 3 && "grid-cols-2 lg:grid-cols-3",
                  layoutCols === 4 && "grid-cols-2 lg:grid-cols-4",
                  // Default fallback if layoutCols isn't matching
                  ![2, 3, 4].includes(layoutCols) && "grid-cols-2 lg:grid-cols-3"
                )}
              >
                {paginatedProducts.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">No products found</h3>
                <p className="text-zinc-500 text-sm">Try adjusting your filters or search criteria.</p>
              </div>
            )}

            {/* Pagination */}
            <React.Suspense fallback={<div className="h-10 w-full flex justify-center mt-12 mb-8"><div className="h-8 w-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-full"></div></div>}>
              <ClpPagination 
                currentPage={paginatedProducts.currentPage} 
                totalPages={paginatedProducts.totalPages} 
              />
            </React.Suspense>
            
          </div>
        </div>
      </div>
    </div>
  );
}
