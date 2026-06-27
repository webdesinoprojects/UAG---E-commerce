import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { getContentPage } from "@/features/content-pages/queries";

export const metadata: Metadata = {
  title: "About Us | UAG",
  description: "Learn about UAG URBN Armour Gear and our product standards.",
};

const values = [
  {
    title: "Useful by design",
    body: "Every product page, feature, and accessory choice is shaped around practical everyday use.",
    icon: CheckCircle2,
  },
  {
    title: "Built for trust",
    body: "Clear specs, dependable support, and safer account handling are core parts of the store.",
    icon: ShieldCheck,
  },
  {
    title: "Ready to ship",
    body: "The storefront is being built for fast catalog updates, managed media, and cleaner operations.",
    icon: Truck,
  },
];

export default async function AboutUsPage() {
  const page = await getContentPage("about-us");

  return (
    <main className="bg-white dark:bg-zinc-950">
      <section className="bg-zinc-950 px-4 py-16 text-white md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
              {page.eyebrow}
            </p>
            <h1 className="mt-5 text-5xl font-heading font-bold leading-tight md:text-7xl">
              {page.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-300">
              {page.description}
            </p>
          </div>
          <div className="relative aspect-[1.25] overflow-hidden rounded-lg bg-zinc-900">
            <Image
              src={page.image}
              alt="UAG product collection"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 dark:bg-zinc-950">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          {page.paragraphs.map((paragraph, index) => (
            <div
              key={index}
              className="rounded-lg border border-zinc-200 bg-white p-6 text-base leading-8 text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 md:p-8"
            >
              {paragraph}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-3">
        {page.blocks.slice(0, 3).map((block, index) => {
          const value = values[index % values.length];
          const Icon = value.icon;
          return (
            <div
              key={block.id}
              className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-2xl font-heading font-semibold">
                {block.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {block.body}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="rounded-lg bg-zinc-100 p-8 dark:bg-zinc-900 md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-heading font-semibold">
              Need help choosing your next product?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Reach the team for product questions, order support, or storefront
              feedback.
            </p>
          </div>
          <Link
            href="/contact-us"
            className="mt-6 inline-flex rounded-lg bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 md:mt-0"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
