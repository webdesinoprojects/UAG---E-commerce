import "server-only";

import { z } from "zod";
import type {
  ContentPage,
  ContentPageBlock,
  ContentPageKey,
} from "@/features/content-pages/types";
import {
  CONTENT_PAGE_DEFINITIONS,
  CONTENT_PAGE_KEYS,
} from "@/features/content-pages/types";

const contentPageKeySchema = z.enum(CONTENT_PAGE_KEYS);

const imagePathSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(
    /^\/images\/[A-Za-z0-9/_-]+\.(png|jpe?g|webp|avif)$/i,
    "Use a local /images/... image path."
  )
  .refine((value) => !value.includes(".."), "Invalid image path.");

const paragraphSchema = z.string().trim().min(1).max(900);
const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const optionalInternalHrefSchema = z
  .string()
  .trim()
  .max(300)
  .regex(/^\/(?!\/)\S*$/, "Use an internal path starting with /.")
  .or(z.literal(""))
  .transform((value) => (value ? value : null));

const contentPageSettingsSchema = z.object({
  eyebrow: z.string().trim().min(1).max(80).optional(),
  title: z.string().trim().min(1).max(140).optional(),
  description: z.string().trim().min(1).max(500).optional(),
  image: imagePathSchema.optional(),
  paragraphs: z.array(paragraphSchema).min(1).max(4).optional(),
});

const contentBlockInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(1200),
  href: optionalInternalHrefSchema.optional(),
  image: imagePathSchema.nullable().optional(),
  imageMediaAssetId: z.string().uuid().nullable().optional(),
  accentColor: hexColorSchema.nullable().optional(),
  backgroundColor: hexColorSchema.nullable().optional(),
  textColor: hexColorSchema.nullable().optional(),
  ctaLabel: z.string().trim().max(40).nullable().optional(),
});

const contentBlockSettingsSchema = z.object({
  image: imagePathSchema.nullable().optional(),
  accentColor: hexColorSchema.nullable().optional(),
  backgroundColor: hexColorSchema.nullable().optional(),
  textColor: hexColorSchema.nullable().optional(),
  ctaLabel: z.string().trim().max(40).nullable().optional(),
});

export const contentPageInputSchema = z.object({
  key: contentPageKeySchema,
  eyebrow: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().min(1).max(500),
  image: imagePathSchema,
  paragraphs: z.array(paragraphSchema).min(1).max(4),
  blocks: z.array(contentBlockInputSchema).min(1).max(12),
});

export type ContentPageInput = z.infer<typeof contentPageInputSchema>;

export type ContentPageSectionRow = {
  is_enabled: boolean;
  settings: unknown;
};

export type ContentPageItemRow = {
  id: string;
  item_key: string | null;
  title: string;
  body: string | null;
  href?: string | null;
  settings?: unknown;
  media_asset_id?: string | null;
  mediaUrl?: string | null;
  sort_order: number;
  is_enabled: boolean;
};

type FallbackBlock = Pick<
  ContentPageBlock,
  "id" | "title" | "body" | "sortOrder"
> &
  Partial<
    Pick<
      ContentPageBlock,
      | "href"
      | "image"
      | "imageUrl"
      | "imageMediaAssetId"
      | "accentColor"
      | "backgroundColor"
      | "textColor"
      | "ctaLabel"
    >
  >;

function toBlock(block: FallbackBlock): ContentPageBlock {
  return {
    href: null,
    image: null,
    imageUrl: block.image ?? null,
    imageMediaAssetId: null,
    accentColor: null,
    backgroundColor: null,
    textColor: null,
    ctaLabel: null,
    ...block,
  };
}

function toBlocks(blocks: FallbackBlock[]): ContentPageBlock[] {
  return blocks.map(toBlock);
}

const fallbackBlocks: Record<ContentPageKey, FallbackBlock[]> = {
  blog: [
    {
      id: "earbuds-guide",
      title: "Choosing earbuds that keep up with long commutes",
      body: "Battery life, comfort, and call clarity matter when your earbuds move from desk calls to evening travel.",
      sortOrder: 10,
    },
    {
      id: "watch-features",
      title: "Smart watch features worth using daily",
      body: "A focused look at everyday features that make a watch useful beyond notifications and step counts.",
      sortOrder: 20,
    },
    {
      id: "charging-care",
      title: "How to keep charging gear travel-ready",
      body: "Simple habits for carrying power banks and cables safely without adding bulk to your everyday kit.",
      sortOrder: 30,
    },
    {
      id: "speaker-setup",
      title: "Speaker setup ideas for compact rooms",
      body: "Placement, volume, and pairing choices that help compact speakers sound cleaner and more balanced.",
      sortOrder: 40,
    },
  ],
  "new-launches": [
    {
      id: "launch-1",
      title: "UAG X1 Earbuds Pro",
      body: "Studio-grade audio with active noise cancellation, long battery life, and a water-resistant travel case.",
      href: "/categories/earbuds",
      image: "/images/categories/earbuds.png",
      accentColor: "#2563eb",
      ctaLabel: "Shop Earbuds",
      sortOrder: 10,
    },
    {
      id: "launch-2",
      title: "UAG PowerCore 20K",
      body: "Portable charging with a 20,000mAh cell, USB-C PD output, and a compact everyday carry profile.",
      href: "/categories/power-banks",
      image: "/images/categories/powerbanks.png",
      accentColor: "#0f766e",
      ctaLabel: "Shop Power",
      sortOrder: 20,
    },
    {
      id: "launch-3",
      title: "UAG SmartWatch Elite",
      body: "A bright AMOLED display, health tracking, and multi-day battery life in a slim modern watch body.",
      href: "/categories/smart-watches",
      image: "/images/categories/watches.png",
      accentColor: "#7c3aed",
      ctaLabel: "Shop Watches",
      sortOrder: 30,
    },
    {
      id: "launch-4",
      title: "UAG Sonic Speakers",
      body: "Room-filling wireless sound with clean controls, durable fabric finish, and all-day playback.",
      href: "/categories/bluetooth-speakers",
      image: "/images/categories/speakers.png",
      accentColor: "#dc2626",
      ctaLabel: "Shop Speakers",
      sortOrder: 40,
    },
    {
      id: "launch-5",
      title: "UAG Neckband Flex",
      body: "Lightweight all-day comfort with magnetic earbuds, stable calls, and fast charging.",
      href: "/categories/neckbands",
      image: "/images/categories/neckbands.png",
      accentColor: "#0891b2",
      ctaLabel: "Shop Neckbands",
      sortOrder: 50,
    },
    {
      id: "launch-6",
      title: "UAG Drone Mini",
      body: "Compact flight control, 4K capture, and smooth stabilized shots for quick creative sessions.",
      href: "/categories/drones",
      image: "/images/categories/drone.png",
      accentColor: "#ea580c",
      ctaLabel: "Explore Drones",
      sortOrder: 60,
    },
  ],
  "about-us": [
    {
      id: "useful-design",
      title: "Useful by design",
      body: "Every product page, feature, and accessory choice is shaped around practical everyday use.",
      sortOrder: 10,
    },
    {
      id: "built-for-trust",
      title: "Built for trust",
      body: "Clear specs, dependable support, and safer account handling are core parts of the store.",
      sortOrder: 20,
    },
  ],
  "contact-us": [
    {
      id: "email",
      title: "Email",
      body: "uagaudio@gmail.com",
      sortOrder: 10,
    },
    {
      id: "support",
      title: "Support",
      body: "Contact us for product questions, order help, and partnership requests.",
      sortOrder: 20,
    },
  ],
  "privacy-policy": [
    {
      id: "browser-device",
      title: "Browser and Device Information",
      body: "We may collect browser, device, and usage information to improve performance, security, analytics, and website experience. We do not store your debit or credit card details on our servers.",
      sortOrder: 10,
    },
    {
      id: "use-information",
      title: "How We Use Your Information",
      body: "We use your information to process and deliver your orders, provide customer support, improve our website and services, send order updates and promotional offers only if you opt in, and prevent fraudulent transactions.",
      sortOrder: 20,
    },
    {
      id: "payment-security",
      title: "Payment Security",
      body: "All payments on our website are processed through secure and trusted third-party payment gateways such as Razorpay, PhonePe, Paytm, or similar providers. We do not store any card or banking details.",
      sortOrder: 30,
    },
    {
      id: "cookies",
      title: "Cookies & Tracking Technologies",
      body: "We use cookies and tracking tools such as Google Analytics and Facebook Pixel to improve user experience, analyze website traffic, and run personalized advertisements. You can disable cookies in your browser settings.",
      sortOrder: 40,
    },
    {
      id: "sharing",
      title: "Sharing of Information",
      body: "We do not sell, trade, or rent your personal information. However, we may share information with courier and logistics partners, payment gateway providers, advertising platforms such as Google Ads and Meta Ads, and legal authorities if required by law.",
      sortOrder: 50,
    },
    {
      id: "security",
      title: "Data Security",
      body: "We implement reasonable security measures to protect your personal data from unauthorized access, misuse, or disclosure. However, no method of transmission over the internet is 100% secure.",
      sortOrder: 60,
    },
    {
      id: "rights",
      title: "Your Rights",
      body: "You have the right to access your personal data, request correction of incorrect information, request deletion of your data, and opt out of marketing emails anytime. For such requests, contact us at the email below.",
      sortOrder: 70,
    },
    {
      id: "third-party",
      title: "Third-Party Links",
      body: "Our website may contain links to third-party websites. We are not responsible for their privacy practices.",
      sortOrder: 80,
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      body: "We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page.",
      sortOrder: 90,
    },
    {
      id: "contact",
      title: "Contact Us",
      body: "If you have any questions regarding this Privacy Policy, please contact us at uagaudio@gmail.com.",
      sortOrder: 100,
    },
  ],
  faqs: [
    {
      id: "track-order",
      title: "How do I track my order?",
      body: "Use the track order page once order tracking is connected, or contact support with your order details.",
      sortOrder: 10,
    },
    {
      id: "account",
      title: "Can I create a customer account?",
      body: "Yes. Register with your email and password to access your customer account area.",
      sortOrder: 20,
    },
  ],
  "home-info": [
    {
      id: "built-for-everyday",
      title: "Built for everyday tech routines",
      body: "UAG brings audio, power, cables, wearables, and practical accessories into a focused shopping experience designed for quick discovery.",
      sortOrder: 10,
    },
    {
      id: "managed-storefront",
      title: "A storefront ready for fresh launches",
      body: "The homepage, catalog, media, and content pages are structured so the store team can keep products and information current from the admin panel.",
      sortOrder: 20,
    },
  ],
};

export const fallbackContentPages: Record<ContentPageKey, ContentPage> = {
  blog: {
    key: "blog",
    ...CONTENT_PAGE_DEFINITIONS.blog,
    eyebrow: "Blog",
    title: "Blog",
    description: "UAG buying guides, product stories, and tech lifestyle notes.",
    image: "/images/categories/earbuds.png",
    paragraphs: [
      "Explore practical tech notes, product care, launch stories, and buying inspiration from UAG.",
    ],
    blocks: toBlocks(fallbackBlocks.blog),
  },
  "new-launches": {
    key: "new-launches",
    ...CONTENT_PAGE_DEFINITIONS["new-launches"],
    eyebrow: "New Launches",
    title: "New Arrivals",
    description:
      "Fresh tech gear, newest audio releases, and the latest accessories from UAG.",
    image: "/images/carousel/banner1.png",
    paragraphs: ["New launch supporting copy is managed through the launch cards."],
    blocks: toBlocks(fallbackBlocks["new-launches"]),
  },
  "about-us": {
    key: "about-us",
    ...CONTENT_PAGE_DEFINITIONS["about-us"],
    eyebrow: "About UAG",
    title: "Gear that fits the rhythm of modern tech life.",
    description:
      "UAG URBN Armour Gear brings everyday electronics, audio, power, and wearable accessories into a focused storefront.",
    image: "/images/carousel/banner1.png",
    paragraphs: [
      "We build the storefront around clear product discovery, practical information, and dependable support.",
      "Every content area is being shaped so the admin team can keep launches, policies, and customer information fresh.",
    ],
    blocks: toBlocks(fallbackBlocks["about-us"]),
  },
  "contact-us": {
    key: "contact-us",
    ...CONTENT_PAGE_DEFINITIONS["contact-us"],
    eyebrow: "Contact Us",
    title: "Product questions, order help, and store support.",
    description:
      "Tell us what you need and the UAG team will route it to the right support path.",
    image: "/images/categories/speakers.png",
    paragraphs: [
      "For product questions, order help, and storefront feedback, contact the UAG support team.",
    ],
    blocks: toBlocks(fallbackBlocks["contact-us"]),
  },
  "privacy-policy": {
    key: "privacy-policy",
    ...CONTENT_PAGE_DEFINITIONS["privacy-policy"],
    eyebrow: "Store Policy",
    title: "Privacy Policy",
    description:
      "A clear overview of how this storefront handles customer information.",
    image: "/images/categories/powerbanks.png",
    paragraphs: [
      "This Privacy Policy explains how UAG collects, uses, shares, and protects customer information.",
    ],
    blocks: toBlocks(fallbackBlocks["privacy-policy"]),
  },
  faqs: {
    key: "faqs",
    ...CONTENT_PAGE_DEFINITIONS.faqs,
    eyebrow: "Help",
    title: "FAQs",
    description: "Quick answers for common UAG storefront and account questions.",
    image: "/images/categories/cables.png",
    paragraphs: [
      "Find quick answers about accounts, products, orders, and customer support.",
    ],
    blocks: toBlocks(fallbackBlocks.faqs),
  },
  "home-info": {
    key: "home-info",
    ...CONTENT_PAGE_DEFINITIONS["home-info"],
    eyebrow: "Why UAG",
    title: "Tech gear with practical everyday purpose.",
    description:
      "A short homepage section for brand messaging, editable from admin.",
    image: "/images/carousel/banner2.png",
    paragraphs: [
      "UAG brings focused product categories together with clean navigation, managed media, and information customers can act on.",
      "From earbuds and power banks to watches and cables, the storefront is designed to help customers compare, choose, and checkout with confidence.",
    ],
    blocks: toBlocks(fallbackBlocks["home-info"]),
  },
};

export function parseContentPageKey(value: string): ContentPageKey | null {
  const parsed = contentPageKeySchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function toContentPage(
  key: ContentPageKey,
  section: ContentPageSectionRow,
  items: ContentPageItemRow[]
): ContentPage {
  const fallback = fallbackContentPages[key];
  const settings = contentPageSettingsSchema.safeParse(section.settings);
  const safeSettings = settings.success ? settings.data : {};
  const blocks = items
    .filter((item) => item.is_enabled)
    .map((item) => {
      const settings = contentBlockSettingsSchema.safeParse(item.settings);
      const safeSettings = settings.success ? settings.data : {};
      const image = safeSettings.image ?? null;

      return {
        id: item.item_key ?? item.id,
        title: item.title,
        body: item.body ?? "",
        href: item.href ?? null,
        image,
        imageUrl: item.mediaUrl ?? image,
        imageMediaAssetId: item.media_asset_id ?? null,
        accentColor: safeSettings.accentColor ?? null,
        backgroundColor: safeSettings.backgroundColor ?? null,
        textColor: safeSettings.textColor ?? null,
        ctaLabel: safeSettings.ctaLabel ?? null,
        sortOrder: item.sort_order,
      };
    })
    .filter((item) => item.title && item.body)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    ...fallback,
    eyebrow: safeSettings.eyebrow ?? fallback.eyebrow,
    title: safeSettings.title ?? fallback.title,
    description: safeSettings.description ?? fallback.description,
    image: safeSettings.image ?? fallback.image,
    paragraphs: safeSettings.paragraphs ?? fallback.paragraphs,
    blocks: blocks.length > 0 ? blocks : fallback.blocks,
  };
}

export function parseContentPageForm(formData: FormData) {
  const blockCount = Math.max(
    1,
    Math.min(Number(formData.get("blockCount") ?? 1), 12)
  );

  return contentPageInputSchema.safeParse({
    key: formData.get("key"),
    eyebrow: formData.get("eyebrow"),
    title: formData.get("title"),
    description: formData.get("description"),
    image: formData.get("image"),
    paragraphs: formData
      .getAll("paragraphs")
      .map((value) => value.toString().trim())
      .filter(Boolean),
    blocks: Array.from({ length: blockCount }, (_, index) => ({
      title: formData.get(`blockTitle-${index}`),
      body: formData.get(`blockBody-${index}`),
      href: formData.get(`blockHref-${index}`) ?? "",
      image: formData.get(`blockImage-${index}`) || null,
      imageMediaAssetId: formData.get(`blockImageMediaAssetId-${index}`) || null,
      accentColor: formData.get(`blockAccentColor-${index}`) || null,
      backgroundColor: formData.get(`blockBackgroundColor-${index}`) || null,
      textColor: formData.get(`blockTextColor-${index}`) || null,
      ctaLabel: formData.get(`blockCtaLabel-${index}`) || null,
    })),
  });
}
