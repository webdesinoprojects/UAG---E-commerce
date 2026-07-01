import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import ProductCard from "@/features/catalog/components/product-card";
import { getTopRatedProducts } from "@/features/catalog/queries";

export const metadata: Metadata = {
  title: "Popular Products | UAG",
  description: "Shop popular UAG products, customer favorites, and top rated tech gear.",
};

export default async function PopularPage() {
  const products = await getTopRatedProducts();

  return (
    <main className="bg-white dark:bg-zinc-950">
      <section className="bg-zinc-950 px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
            <Star className="h-4 w-4" aria-hidden="true" />
            Customer Favorites
          </p>
          <h1 className="mt-5 text-5xl font-heading font-bold leading-tight md:text-7xl">
            Popular Products
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300">
            Top rated picks and high-interest products from the UAG catalog.
          </p>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-7xl">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-800">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                Popular products will appear here after catalog activity is available.
              </p>
              <Link
                href="/categories"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                Browse categories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
