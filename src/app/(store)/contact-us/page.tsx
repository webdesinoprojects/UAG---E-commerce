import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { getContentPage } from "@/features/content-pages/queries";
import { ContactForm } from "./_components/contact-form";

export const metadata: Metadata = {
  title: "Contact Us | UAG",
  description: "Contact UAG support for product, order, and partnership help.",
};

const contactCards = [
  {
    title: "Email",
    value: "support@uag.example",
    icon: Mail,
  },
  {
    title: "Phone",
    value: "+91 00000 00000",
    icon: Phone,
  },
  {
    title: "Location",
    value: "India",
    icon: MapPin,
  },
];

export default async function ContactUsPage() {
  const page = await getContentPage("contact-us");

  return (
    <main className="bg-white dark:bg-zinc-950">
      <section className="bg-zinc-950 px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
            {page.eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-heading font-bold leading-tight md:text-7xl">
            {page.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300">
            {page.description}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-4">
          {page.blocks.slice(0, 3).map((block, index) => {
            const card = contactCards[index % contactCards.length];
            const Icon = card.icon;
            return (
              <div
                key={block.id}
                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                      {block.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {block.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ContactForm />
      </section>
    </main>
  );
}
