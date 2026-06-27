import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getContentPage } from "@/features/content-pages/queries";

export const metadata: Metadata = {
  title: "New Launches | UAG",
  description: "Discover the latest tech gear, audio releases, and accessories from UAG URBN Armour Gear.",
};

const fallbackBlockImages: Record<string, string> = {
  "launch-1": "/images/categories/earbuds.png",
  "launch-2": "/images/categories/powerbanks.png",
  "launch-3": "/images/categories/watches.png",
  "launch-4": "/images/categories/speakers.png",
  "launch-5": "/images/categories/neckbands.png",
  "launch-6": "/images/categories/drone.png",
};

export default async function NewLaunchesPage() {
  const page = await getContentPage("new-launches");
  const launches = page.blocks.filter((block) => block.title && block.body);

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-zinc-950 px-4 py-16 text-white md:py-24">
        <div className="relative mx-auto max-w-7xl">
          <div className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            {page.eyebrow}
          </div>
          <h1 className="mt-5 text-5xl font-heading font-bold leading-tight md:text-7xl">
            {page.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300">
            {page.description}
          </p>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Latest Collection
          </p>
          <h2 className="mt-3 text-3xl font-heading font-bold text-zinc-950 md:text-4xl">
            Built for the next upgrade.
          </h2>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {launches.map((block) => {
            const blockImage =
              block.imageUrl ?? fallbackBlockImages[block.id] ?? page.image;
            const cardBackground = block.backgroundColor ?? "#ffffff";
            const cardText = block.textColor ?? "#18181b";
            const accent = block.accentColor ?? "#2563eb";
            const href = block.href ?? "/categories";
            return (
              <article
                key={block.id}
                className="group relative overflow-hidden rounded-xl border border-zinc-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ backgroundColor: cardBackground, color: cardText }}
              >
                <div className="relative aspect-[1.15] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={blockImage}
                    alt={block.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-heading font-bold">
                    {block.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 opacity-75">
                    {block.body}
                  </p>
                  <Link
                    href={href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-75"
                    style={{ color: accent }}
                  >
                    {block.ctaLabel ?? "View Product"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

    </main>
  );
}
