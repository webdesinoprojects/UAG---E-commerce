import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { CatalogCategoryDto } from "@/features/catalog/types";

interface ProductCategoryGridProps {
  categories: CatalogCategoryDto[];
}

const LOCAL_CATEGORY_FALLBACKS: Record<string, string> = {
  earbuds: "/images/categories/earbuds.png",
  neckbands: "/images/categories/neckbands.png",
  "bluetooth-speaker": "/images/categories/speakers.png",
  "bluetooth-speakers": "/images/categories/speakers.png",
  "power-banks": "/images/categories/powerbanks.png",
  "smart-watch": "/images/categories/watches.png",
  "smart-watches": "/images/categories/watches.png",
  "data-cable": "/images/categories/cables.png",
  "data-cables": "/images/categories/cables.png",
};

export default function ProductCategoryGrid({
  categories,
}: ProductCategoryGridProps) {
  const featuredCategories = categories.filter(
    (category) => category.isActive && category.isFeatured
  );

  if (featuredCategories.length === 0) {
    return null;
  }

  return (
    <section className="w-full border-t border-zinc-100 bg-white py-12 font-sans dark:border-zinc-800/40 dark:bg-zinc-900/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
            Featured Collections
          </span>
          <h2 className="mt-1.5 text-2xl font-black text-zinc-900 sm:text-3xl dark:text-white">
            Shop by Tech Category
          </h2>
          <Separator className="mt-3 h-1 w-12 rounded-full bg-primary" />
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-6">
          {featuredCategories.map((category) => {
            const imageUrl =
              category.mediaUrl ??
              LOCAL_CATEGORY_FALLBACKS[category.slug] ??
              null;

            return (
              <Link
                key={category.id}
                href={"/categories/" + category.slug}
                className="group flex min-w-0 flex-col items-center text-center"
              >
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition-all duration-300 group-hover:border-zinc-200 group-hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-800/20 dark:group-hover:border-zinc-700">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={category.name}
                      width={160}
                      height={160}
                      className="max-h-[120px] w-auto object-contain transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <ImageIcon
                      className="h-10 w-10 text-zinc-300 dark:text-zinc-600"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="mt-4 flex min-w-0 flex-col items-center px-1">
                  <h3 className="flex min-h-9 items-center justify-center text-xs font-bold leading-snug text-zinc-800 transition-colors group-hover:text-primary dark:text-zinc-200">
                    {category.name}
                  </h3>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "product" : "products"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
