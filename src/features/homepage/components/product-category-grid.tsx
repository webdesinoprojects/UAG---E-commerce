import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
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

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  earbuds: "Earbuds Or Airdopes ENC",
  neckbands: "Neckband with Magnetic Sensor or ENC",
  neckband: "Neckband with Magnetic Sensor or ENC",
  "bluetooth-speaker": "Portable & Party Speaker with Clear Bass",
  "bluetooth-speakers": "Portable & Party Speaker with Clear Bass",
  "power-banks": "Power Bank Fast Charge Technology",
  "smart-watch": "Smart Watch with Calling",
  "smart-watches": "Smart Watch with Calling",
  "data-cable": "Fast Charging Data Cable",
  "data-cables": "Fast Charging Data Cable",
};

const CATEGORY_DISPLAY_ORDER: Record<string, number> = {
  earbuds: 0,
  neckband: 1,
  neckbands: 1,
  "bluetooth-speaker": 2,
  "bluetooth-speakers": 2,
  "power-banks": 3,
  "smart-watch": 4,
  "smart-watches": 4,
  "data-cable": 5,
  "data-cables": 5,
};

export default function ProductCategoryGrid({
  categories,
}: ProductCategoryGridProps) {
  const featuredCategories = categories
    .filter((category) => category.isActive && category.isFeatured)
    .sort(
      (first, second) =>
        (CATEGORY_DISPLAY_ORDER[first.slug] ?? Number.MAX_SAFE_INTEGER) -
        (CATEGORY_DISPLAY_ORDER[second.slug] ?? Number.MAX_SAFE_INTEGER)
    );

  if (featuredCategories.length === 0) {
    return null;
  }

  return (
    <section className="w-full border-t border-zinc-100 bg-white py-10 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide md:gap-8">
          {featuredCategories.map((category) => {
            const imageUrl =
              category.mediaUrl ??
              LOCAL_CATEGORY_FALLBACKS[category.slug] ??
              null;

            return (
              <Link
                key={category.id}
                href={"/categories/" + category.slug}
                className="group flex w-[44vw] max-w-[11rem] shrink-0 snap-start flex-col items-center text-center md:w-[calc((100%-10rem)/6)] md:max-w-none md:min-w-0"
              >
                <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-white p-3">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={category.name}
                      width={160}
                      height={160}
                      className="max-h-[9rem] w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <ImageIcon
                      className="h-10 w-10 text-zinc-300 dark:text-zinc-600"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="mt-3 flex min-w-0 flex-col items-center px-1">
                  <h3 className="flex min-h-14 items-start justify-center text-center font-sans text-sm font-semibold leading-snug text-black transition-colors group-hover:text-primary sm:text-base">
                    {CATEGORY_DISPLAY_NAMES[category.slug] ?? category.name}
                  </h3>
                  <span className="mt-1 text-xs font-normal text-zinc-500">
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
