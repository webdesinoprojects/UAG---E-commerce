"use client";

import React from "react";
import { Star, CheckCircle, UserCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ProductDetail } from "../types";

interface ProductReviewsProps {
  reviews: NonNullable<ProductDetail["reviews"]>;
}

const ITEMS_PER_PAGE = 6;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex text-blue-800 dark:text-blue-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${star <= rating ? "fill-current" : "text-zinc-300 dark:text-zinc-700"}`}
        />
      ))}
    </div>
  );
}

export function ProductReviews({ reviews }: ProductReviewsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current page and sort from URL (or local state, but let's use URL for sort too to make it shareable)
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSort = searchParams.get("sort") || "Most Recent";

  // Sorting Logic
  const sortedReviews = [...reviews.list].sort((a, b) => {
    switch (currentSort) {
      case "Highest Rating":
        return b.rating - a.rating;
      case "Lowest Rating":
        return a.rating - b.rating;
      case "Most Recent":
      default:
        // Mock sorting by date (using string comparison or assuming ID order is chronological)
        // Since mock data has decreasing dates, ID order is already "Most Recent"
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedReviews.length / ITEMS_PER_PAGE);

  // Derive slice for current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentReviews = sortedReviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.set("page", "1"); // reset to page 1 on sort change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-zinc-50 dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-zinc-800 mt-16 lg:mt-24">
      <section className="py-12 lg:py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl md:text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-8 md:mb-10">
          Customer Reviews
        </h2>

        {/* Stats Block */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 mb-12">
          {/* Left: Overall Rating */}
          <div className="flex flex-col items-center justify-center md:min-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={Math.round(reviews.stats.average)} />
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {reviews.stats.average} out of 5
              </span>
            </div>
            <div className="flex items-center gap-1 text-[13px] text-zinc-600 dark:text-zinc-400">
              Based on {reviews.stats.totalCount} reviews
              <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
            </div>
          </div>

          {/* Middle: Distribution Bars */}
          <div className="w-full max-w-[400px] flex flex-col gap-2 md:border-l md:border-r border-zinc-200 dark:border-zinc-800 md:px-8">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.stats.distribution[stars as keyof typeof reviews.stats.distribution];
              const percentage = (count / reviews.stats.totalCount) * 100;
              return (
                <div key={stars} className="flex items-center gap-3 text-[11px] sm:text-xs">
                  <div className="flex text-blue-800 dark:text-blue-400 w-14 sm:w-16">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-2.5 h-2.5 ${star <= stars ? "fill-current" : "text-transparent"}`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-[#3b4b8a] dark:bg-blue-600 rounded-sm"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-6 text-right text-zinc-500 dark:text-zinc-400">{count}</div>
                </div>
              );
            })}
          </div>

          {/* Right: Write Review Button */}
          <div className="flex items-center justify-center w-full md:w-auto md:min-w-[200px]">
            <button className="bg-[#3b4b8a] hover:bg-[#2d3a6e] text-white px-8 py-3 md:py-2.5 rounded text-sm font-bold transition-colors w-full md:w-auto">
              Write a review
            </button>
          </div>
        </div>

        <hr className="border-zinc-200 dark:border-zinc-800 mb-6" />

      {/* Sort Dropdown */}
      <div className="flex justify-start mb-6">
        <select 
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="text-[#3b4b8a] dark:text-blue-400 text-[13px] font-medium bg-transparent border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="Most Recent">Most Recent</option>
          <option value="Highest Rating">Highest Rating</option>
          <option value="Lowest Rating">Lowest Rating</option>
          <option value="Only Pictures">Only Pictures</option>
          <option value="Pictures First">Pictures First</option>
          <option value="Videos First">Videos First</option>
          <option value="Most Helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col">
        {currentReviews.map((review) => (
          <div key={review.id} className="py-6 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-2">
                <StarRating rating={review.rating} />
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <UserCircle2 className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                    {review.isVerified && (
                      <CheckCircle className="w-3.5 h-3.5 text-[#3b4b8a] dark:text-blue-500 absolute -bottom-1 -right-1 bg-white dark:bg-[#050505] rounded-full" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-[#3b4b8a] dark:text-blue-400">{review.author}</span>
                    {review.isVerified && (
                      <span className="bg-[#3b4b8a] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                {review.date}
              </div>
            </div>
            
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-[13px] mb-2">
              {review.title}
            </h4>
            <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {review.content}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-sm font-medium">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                    currentPage === page
                      ? "bg-[#3b4b8a] text-white"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      </section>
    </div>
  );
}
