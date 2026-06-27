import type { Metadata } from "next";
import { Suspense } from "react";
import { searchProducts } from "@/features/catalog/queries";
import { SearchExperience } from "./_components/search-experience";

export const metadata: Metadata = {
  title: "Search Products | UAG",
  description: "Search UAG products, audio gear, power accessories, and tech essentials.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense
      fallback={
        <section className="min-h-[calc(100vh-4rem)] bg-white">
          <div className="border-b border-zinc-200 px-4 py-10 md:py-14">
            <div className="mx-auto max-w-6xl text-center font-heading text-4xl font-bold text-zinc-800 md:text-6xl">
              Search for products
            </div>
          </div>
        </section>
      }
    >
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchContent({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const products = query.length >= 2 ? await searchProducts(query) : [];

  return <SearchExperience initialQuery={query} products={products} />;
}
