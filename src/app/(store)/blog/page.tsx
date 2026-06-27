import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getContentPage } from "@/features/content-pages/queries";

export const metadata: Metadata = {
  title: "Blog | UAG",
  description: "UAG buying guides, product stories, and tech lifestyle notes.",
};

const posts = [
  {
    title: "Choosing earbuds that keep up with long commutes",
    category: "Buying Guide",
    image: "/images/categories/earbuds.png",
    excerpt:
      "Battery life, comfort, and call clarity matter more when your earbuds move from desk calls to evening travel.",
  },
  {
    title: "Smart watch features that are worth using daily",
    category: "Wearables",
    image: "/images/categories/watches.png",
    excerpt:
      "A focused look at the everyday features that make a watch useful beyond notifications and step counts.",
  },
  {
    title: "How to keep charging gear travel-ready",
    category: "Care",
    image: "/images/categories/powerbanks.png",
    excerpt:
      "Simple habits for carrying power banks and cables safely without adding bulk to your everyday kit.",
  },
  {
    title: "Speaker setup ideas for compact rooms",
    category: "Audio",
    image: "/images/categories/speakers.png",
    excerpt:
      "Placement, volume, and pairing choices that help small-room speakers sound cleaner and more balanced.",
  },
  {
    title: "Cable basics: what to check before replacing one",
    category: "Essentials",
    image: "/images/categories/cables.png",
    excerpt:
      "A quick guide to connector type, cable length, charging rating, and the small details that prevent frustration.",
  },
  {
    title: "Neckbands still make sense for active days",
    category: "Lifestyle",
    image: "/images/categories/neckbands.png",
    excerpt:
      "Why lightweight neckbands remain a practical option for workouts, calls, and long listening sessions.",
  },
];

export default async function BlogPage() {
  const page = await getContentPage("blog");

  return (
    <main className="bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <section className="relative flex min-h-[280px] items-start justify-center overflow-hidden bg-zinc-950 px-4 py-10 text-center text-white md:min-h-[340px]">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="relative z-10">
          <h1 className="text-6xl font-heading font-bold leading-none tracking-normal md:text-8xl">
            {page.title}
          </h1>
          <div className="mt-9 flex items-center justify-center gap-3 text-sm font-semibold">
            <Link href="/" className="text-cyan-100 hover:text-white">
              Home
            </Link>
            <span className="text-zinc-500">/</span>
            <span>Blog</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-7 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {page.blocks.map((post, index) => {
          const image = posts[index % posts.length]?.image ?? page.image;
          const category = posts[index % posts.length]?.category ?? page.eyebrow;

          return (
          <article
            key={post.id}
            className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="relative aspect-[1.45] bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={image}
                alt={post.title}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute left-5 top-5 rounded-lg bg-white px-4 py-3 text-center text-zinc-950 shadow-lg">
                <div className="text-2xl font-semibold leading-none">
                  {String(9 + index).padStart(2, "0")}
                </div>
                <div className="mt-1 text-xs font-bold uppercase">Sep</div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-blue-600 px-4 py-1.5 text-xs font-bold uppercase text-white shadow">
                {category}
              </div>
            </div>

            <div className="px-6 pb-8 pt-8 text-center">
              <h2 className="min-h-[72px] text-2xl font-heading font-semibold leading-snug text-zinc-800 dark:text-white">
                {post.title}
              </h2>
              <p className="mt-5 text-sm font-medium text-zinc-400">
                Posted by{" "}
                <span className="font-semibold text-zinc-500">
                  UAG URBN ARMOUR GEAR
                </span>
              </p>
              <div className="mt-4 flex justify-center text-zinc-400">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
                <span className="-ml-1 -mt-2 rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                  0
                </span>
              </div>
              <p className="mt-6 min-h-[84px] text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                {post.body}
              </p>
              <Link
                href="/blog"
                className="mt-6 inline-flex text-sm font-bold uppercase text-blue-600 hover:text-blue-700"
              >
                Continue Reading
              </Link>
            </div>
          </article>
          );
        })}
      </section>
    </main>
  );
}
