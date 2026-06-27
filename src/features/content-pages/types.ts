export type ContentPageKey =
  | "blog"
  | "about-us"
  | "contact-us"
  | "privacy-policy"
  | "faqs"
  | "home-info"
  | "new-launches";

export interface ContentPageBlock {
  id: string;
  title: string;
  body: string;
  href: string | null;
  image: string | null;
  imageUrl: string | null;
  imageMediaAssetId: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  ctaLabel: string | null;
  sortOrder: number;
}

export interface ContentPage {
  key: ContentPageKey;
  route: string;
  adminTitle: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  paragraphs: string[];
  blocks: ContentPageBlock[];
}

export const CONTENT_PAGE_DEFINITIONS: Record<
  ContentPageKey,
  { route: string; adminTitle: string }
> = {
  blog: { route: "/blog", adminTitle: "Blog" },
  "about-us": { route: "/about-us", adminTitle: "About Us" },
  "contact-us": { route: "/contact-us", adminTitle: "Contact Us" },
  "privacy-policy": {
    route: "/privacy-policy",
    adminTitle: "Privacy Policy",
  },
  faqs: { route: "/faqs", adminTitle: "FAQs" },
  "home-info": { route: "/", adminTitle: "Homepage Info Section" },
  "new-launches": { route: "/new-launches", adminTitle: "New Launches" },
};

export const CONTENT_PAGE_KEYS = [
  "blog",
  "about-us",
  "contact-us",
  "privacy-policy",
  "faqs",
  "home-info",
  "new-launches",
] as const satisfies readonly ContentPageKey[];
