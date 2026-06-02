"use client";

import React from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClpPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function ClpPagination({ currentPage, totalPages }: ClpPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8 font-sans">
      {currentPage === 1 ? (
        <span
          className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 opacity-50 cursor-not-allowed"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </span>
      ) : (
        <Link
          href={createPageURL(currentPage - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 dark:hover:text-white dark:hover:border-zinc-600 transition-colors"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      )}

      {pages.map((page) => {
        if (currentPage === page) {
          return (
            <span
              key={page}
              className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md"
            >
              {page}
            </span>
          );
        }

        return (
          <Link
            key={page}
            href={createPageURL(page)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
          >
            {page}
          </Link>
        );
      })}

      {currentPage === totalPages ? (
        <span
          className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 opacity-50 cursor-not-allowed"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </span>
      ) : (
        <Link
          href={createPageURL(currentPage + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 dark:hover:text-white dark:hover:border-zinc-600 transition-colors"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
