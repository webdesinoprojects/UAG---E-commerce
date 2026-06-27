import type { Metadata } from "next";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getContentPage } from "@/features/content-pages/queries";

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

        <form className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="name">
                Name
              </label>
              <Input id="name" name="name" className="mt-2" placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                className="mt-2"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold" htmlFor="subject">
              Subject
            </label>
            <Input
              id="subject"
              name="subject"
              className="mt-2"
              placeholder="How can we help?"
            />
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold" htmlFor="message">
              Message
            </label>
            <Textarea
              id="message"
              name="message"
              className="mt-2 min-h-36"
              placeholder="Share the details..."
            />
          </div>
          <Button type="button" className="mt-6">
            <Send className="h-4 w-4" aria-hidden="true" />
            Send Message
          </Button>
        </form>
      </section>
    </main>
  );
}
