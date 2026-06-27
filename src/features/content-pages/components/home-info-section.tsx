import Image from "next/image";
import { getContentPage } from "@/features/content-pages/queries";

export default async function HomeInfoSection() {
  const page = await getContentPage("home-info");

  return (
    <section className="bg-white px-4 py-14 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-[0.9fr_1.1fr] md:p-8">
        <div className="relative min-h-[320px] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={page.image}
            alt={page.title}
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {page.eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-heading font-bold leading-tight text-zinc-950 dark:text-white md:text-5xl">
            {page.title}
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
            {page.paragraphs.slice(0, 2).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
