"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { Product } from "@/features/catalog/components/product-card";

interface SearchExperienceProps {
  initialQuery: string;
  products: Product[];
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function SearchExperience({
  initialQuery,
  products,
}: SearchExperienceProps) {
  const [query, setQuery] = React.useState(initialQuery);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const trimmedQuery = query.trim();

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString());

      if (trimmedQuery) {
        nextParams.set("q", trimmedQuery);
      } else {
        nextParams.delete("q");
      }

      const nextUrl = nextParams.toString()
        ? `${pathname}?${nextParams.toString()}`
        : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [pathname, router, searchParams, trimmedQuery]);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="border-b border-zinc-200 px-4 py-10 md:py-14">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Search className="hidden h-12 w-12 text-zinc-300 md:block" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for products"
            className="min-w-0 flex-1 bg-transparent text-center font-heading text-4xl font-bold text-zinc-800 outline-none placeholder:text-zinc-800 md:text-6xl"
          />
          <Link
            href="/"
            aria-label="Close search"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-zinc-800 transition-colors hover:bg-zinc-100"
          >
            <X className="h-10 w-10" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-9">
        {!trimmedQuery ? (
          <p className="text-center text-lg text-zinc-500">
            Start typing to see products you are looking for.
          </p>
        ) : products.length === 0 ? (
          <div className="mx-auto max-w-xl text-center">
            <p className="text-lg font-semibold text-zinc-900">
              No products found for &quot;{trimmedQuery}&quot;.
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Try searching by product name, brand, or SKU.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              {products.length} result{products.length === 1 ? "" : "s"} found
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group grid grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-lg border border-zinc-200 bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-md sm:block"
                >
                  <div className="relative aspect-square overflow-hidden rounded-md bg-zinc-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 96px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 pt-1 sm:pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {product.category}
                    </p>
                    <h2 className="mt-1 line-clamp-2 text-sm font-bold text-zinc-900">
                      {product.name}
                    </h2>
                    <p className="mt-2 text-sm font-black text-blue-600">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
