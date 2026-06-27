import type { Metadata } from "next";
import { getContentPage } from "@/features/content-pages/queries";

export const metadata: Metadata = {
  title: "Privacy Policy | UAG",
  description: "Read the UAG storefront privacy policy.",
};

export default async function PrivacyPolicyPage() {
  const page = await getContentPage("privacy-policy");

  return (
    <main className="bg-white dark:bg-zinc-950">
      <section className="bg-zinc-950 px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
            {page.eyebrow}
          </p>
          <h1 className="mt-5 text-5xl font-heading font-bold leading-tight md:text-7xl">
            {page.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300">
            {page.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="space-y-4">
          {page.blocks.map((section) => (
            <section
              key={section.id}
              className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="text-2xl font-heading font-semibold">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
