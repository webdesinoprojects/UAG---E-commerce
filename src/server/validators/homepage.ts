import "server-only";

import { z } from "zod";
import type {
  HomepageAnnouncement,
  HomepageAnnouncementItem,
  HomepageHeroCarousel,
  HomepageHeroSlide,
  HomepageCategoryCircle,
  HomepageCategoryCircles,
  HomepageBentoGallery,
  HomepageBentoItem,
  HomepageMerchandisingBanners,
  HomepageMerchandisingSlide,
  SiteFooterContent,
  SiteFooterLink,
  SiteFooterSocialLink,
  HeroSlideFeature,
} from "@/features/homepage/types";

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const safeHrefSchema = z
  .union([
    z.string().regex(/^\/(?!\/)/),
    z.string().url().regex(/^https?:\/\//),
  ])
  .nullable();

const announcementSettingsSchema = z.object({
  backgroundColor: hexColorSchema.optional(),
  textColor: hexColorSchema.optional(),
  accentColor: hexColorSchema.optional(),
  speedSeconds: z.coerce.number().int().min(10).max(120).optional(),
});

const announcementItemSettingsSchema = z.object({
  icon: z.enum(["truck", "sparkles", "star"]).optional(),
});

const announcementItemSchema = z.object({
  id: z.string().min(1).max(120),
  text: z.string().trim().min(1).max(140),
  icon: z.enum(["truck", "sparkles", "star"]),
  href: safeHrefSchema,
  sortOrder: z.coerce.number().int().min(0).max(10_000),
});

export const homepageAnnouncementInputSchema = z.object({
  isEnabled: z.boolean(),
  backgroundColor: hexColorSchema,
  textColor: hexColorSchema,
  accentColor: hexColorSchema,
  speedSeconds: z.coerce.number().int().min(10).max(120),
  messages: z
    .array(z.string().trim().min(1).max(140))
    .min(1, "At least one message is required.")
    .max(8, "Use at most 8 marquee messages."),
});

export type HomepageAnnouncementInput = z.infer<
  typeof homepageAnnouncementInputSchema
>;

export function parseHomepageAnnouncementForm(formData: FormData) {
  return homepageAnnouncementInputSchema.safeParse({
    isEnabled: formData.get("isEnabled") === "true",
    backgroundColor: formData.get("backgroundColor"),
    textColor: formData.get("textColor"),
    accentColor: formData.get("accentColor"),
    speedSeconds: formData.get("speedSeconds"),
    messages: formData.getAll("messages"),
  });
}

export const fallbackHomepageAnnouncement: HomepageAnnouncement = {
  isEnabled: true,
  backgroundColor: "#09090b",
  textColor: "#ffffff",
  accentColor: "#f59e0b",
  speedSeconds: 35,
  items: [
    {
      id: "fast-free-delivery",
      text: "FAST & FREE DELIVERY ON EVERY ORDER",
      icon: "truck",
      href: null,
      sortOrder: 10,
    },
    {
      id: "prepaid-discount",
      text: "GET 5% EXTRA DISCOUNT ON PREPAID ORDERS",
      icon: "sparkles",
      href: null,
      sortOrder: 20,
    },
  ],
};

type CmsSectionRow = {
  is_enabled: boolean;
  settings: unknown;
};

type CmsSectionItemRow = {
  href: string | null;
  id: string;
  is_enabled: boolean;
  item_key: string | null;
  settings: unknown;
  sort_order: number;
  title: string;
};

function parseAnnouncementItem(
  item: CmsSectionItemRow
): HomepageAnnouncementItem | null {
  if (!item.is_enabled) {
    return null;
  }

  const itemSettings = announcementItemSettingsSchema.safeParse(item.settings);
  const parsed = announcementItemSchema.safeParse({
    id: item.item_key ?? item.id,
    text: item.title,
    icon: itemSettings.success ? itemSettings.data.icon ?? "sparkles" : "sparkles",
    href: item.href,
    sortOrder: item.sort_order,
  });

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export function toHomepageAnnouncement(
  section: CmsSectionRow,
  items: CmsSectionItemRow[]
): HomepageAnnouncement {
  const sectionSettings = announcementSettingsSchema.safeParse(section.settings);
  const safeSettings = sectionSettings.success ? sectionSettings.data : {};
  const safeItems = items
    .map(parseAnnouncementItem)
    .filter((item): item is HomepageAnnouncementItem => Boolean(item))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Display config (colors/speed) still falls back to safe defaults when the
  // section settings are missing or invalid. Item content does NOT fall back:
  // an existing section with zero valid/enabled items returns an empty list so
  // the storefront hides it. Fallback content is only used when the section row
  // itself is missing/unavailable, which the repository handles separately.
  return {
    isEnabled: section.is_enabled,
    backgroundColor:
      safeSettings.backgroundColor ??
      fallbackHomepageAnnouncement.backgroundColor,
    textColor: safeSettings.textColor ?? fallbackHomepageAnnouncement.textColor,
    accentColor:
      safeSettings.accentColor ?? fallbackHomepageAnnouncement.accentColor,
    speedSeconds:
      safeSettings.speedSeconds ?? fallbackHomepageAnnouncement.speedSeconds,
    items: safeItems,
  };
}

/* -------------------------------------------------------------------------- */
/* Homepage hero carousel                                                     */
/* -------------------------------------------------------------------------- */

// Internal-only hrefs. Must begin with a single "/" so external schemes such
// as `javascript:` or protocol-relative `//host` URLs can never pass through.
const safeInternalHrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(/^\/(?!\/)\S*$/, "Use an internal path starting with /.");

// Local image assets only, under public/images, with a known image extension.
const heroImagePathSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(
    /^\/images\/[A-Za-z0-9/_-]+\.(png|jpe?g|webp|avif)$/i,
    "Use a local /images/... path."
  )
  .refine((value) => !value.includes(".."), "Invalid image path.");

const heroFeatureIconSchema = z.enum([
  "volume",
  "sparkles",
  "cpu",
  "shield",
  "zap",
  "bluetooth",
  "link",
  "check",
]);

const heroFeatureInputSchema = z.object({
  text: z.string().trim().min(1).max(80),
  icon: heroFeatureIconSchema.catch("sparkles"),
});

const heroSlideInputSchema = z.object({
  id: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(280),
  image: heroImagePathSchema,
  imageMediaAssetId: z.string().uuid().nullable().optional(),
  accentColor: hexColorSchema,
  badgeText: z.string().trim().min(1).max(40),
  primaryCtaLabel: z.string().trim().min(1).max(40),
  primaryCtaHref: safeInternalHrefSchema,
  secondaryCtaLabel: z.string().trim().min(1).max(40),
  secondaryCtaHref: safeInternalHrefSchema,
  features: z.array(heroFeatureInputSchema).min(1).max(4),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
  isEnabled: z.boolean(),
});

export const homepageHeroCarouselInputSchema = z.object({
  isEnabled: z.boolean(),
  autoplaySeconds: z.coerce.number().int().min(3).max(30),
  slides: z
    .array(heroSlideInputSchema)
    .min(1, "At least one slide is required.")
    .max(12, "Use at most 12 hero slides."),
});

export type HomepageHeroCarouselInput = z.infer<
  typeof homepageHeroCarouselInputSchema
>;

export function parseHomepageHeroCarouselForm(formData: FormData) {
  const rawCount = Number(formData.get("slideCount"));
  const slideCount = Number.isFinite(rawCount)
    ? Math.min(Math.max(rawCount, 0), 12)
    : 0;

  const slides = Array.from({ length: slideCount }, (_, index) => {
    const prefix = `slide-${index}-`;
    const read = (field: string) => formData.get(`${prefix}${field}`);

    const features = [
      { text: read("feature1"), icon: read("feature1Icon") },
      { text: read("feature2"), icon: read("feature2Icon") },
    ]
      .filter((feature) => typeof feature.text === "string" && feature.text.trim())
      .map((feature) => ({ text: feature.text, icon: feature.icon }));

    return {
      id: `slide-${index + 1}`,
      title: read("title"),
      subtitle: read("subtitle"),
      description: read("description"),
      image: read("image"),
      imageMediaAssetId: read("imageMediaAssetId") || null,
      accentColor: read("accentColor"),
      badgeText: read("badgeText"),
      primaryCtaLabel: read("primaryCtaLabel"),
      primaryCtaHref: read("primaryCtaHref"),
      secondaryCtaLabel: read("secondaryCtaLabel"),
      secondaryCtaHref: read("secondaryCtaHref"),
      features,
      sortOrder: (index + 1) * 10,
      isEnabled: read("enabled") === "true",
    };
  });

  return homepageHeroCarouselInputSchema.safeParse({
    isEnabled: formData.get("isEnabled") === "true",
    autoplaySeconds: formData.get("autoplaySeconds"),
    slides,
  });
}

export const fallbackHomepageHeroCarousel: HomepageHeroCarousel = {
  isEnabled: true,
  autoplaySeconds: 5,
  slides: [
    {
      id: "slide-1",
      title: "EARBUDS 300 LITE",
      subtitle: "Cybernetic Sound & Extra Bass",
      description:
        "Engineered for maximum sound isolation and heavy tactical environments. Complete with integrated case display control.",
      image: "/images/carousel/banner1.png",
      fallbackImagePath: "/images/carousel/banner1.png",
      imageMediaAssetId: null,
      accentColor: "#fbbf24",
      badgeText: "Product Launch",
      primaryCtaLabel: "Explore Now",
      primaryCtaHref: "/categories/earbuds",
      secondaryCtaLabel: "View Details",
      secondaryCtaHref: "/categories/earbuds",
      features: [
        { text: "Active Noise Cancellation", icon: "volume" },
        { text: "Sound Extra Bass Boost", icon: "sparkles" },
      ],
      sortOrder: 10,
      isEnabled: true,
    },
    {
      id: "slide-2",
      title: "PORTABLE SPEAKERS",
      subtitle: "Powerful Audio & Ambient Glow",
      description:
        "Take the power of studio-grade acoustics anywhere. Rugged waterproof chassis with synchronized LED rings.",
      image: "/images/carousel/banner2.png",
      fallbackImagePath: "/images/carousel/banner2.png",
      imageMediaAssetId: null,
      accentColor: "#ef4444",
      badgeText: "Product Launch",
      primaryCtaLabel: "Explore Now",
      primaryCtaHref: "/categories/bluetooth-speakers",
      secondaryCtaLabel: "View Details",
      secondaryCtaHref: "/categories/bluetooth-speakers",
      features: [
        { text: "Rich Stereo Sound Output", icon: "volume" },
        { text: "Ambient RGB Illumination", icon: "sparkles" },
      ],
      sortOrder: 20,
      isEnabled: true,
    },
    {
      id: "slide-3",
      title: "TACTICAL WATCH PRO",
      subtitle: "Military Grade Smart Watch",
      description:
        "Built to survive extreme conditions. Real-time biometric tracking, built-in GPS, and a robust battery life of 30 days.",
      image: "/images/carousel/banner1.png",
      fallbackImagePath: "/images/carousel/banner1.png",
      imageMediaAssetId: null,
      accentColor: "#34d399",
      badgeText: "Product Launch",
      primaryCtaLabel: "Explore Now",
      primaryCtaHref: "/categories/smart-watches",
      secondaryCtaLabel: "View Details",
      secondaryCtaHref: "/categories/smart-watches",
      features: [
        { text: "Advanced Biometric Sensors", icon: "cpu" },
        { text: "Impact-Resistant Bezel", icon: "shield" },
      ],
      sortOrder: 30,
      isEnabled: true,
    },
  ],
};

export type HeroCmsSectionItemRow = CmsSectionItemRow & {
  subtitle: string | null;
  body: string | null;
  media_asset_id: string | null;
  mediaUrl?: string | null;
};

const heroSectionSettingsSchema = z.object({
  autoplaySeconds: z.coerce.number().int().min(3).max(30).optional(),
});

const heroItemSettingsSchema = z.object({
  image: heroImagePathSchema.optional(),
  accentColor: hexColorSchema.optional(),
  badgeText: z.string().trim().min(1).max(40).optional(),
  primaryCtaLabel: z.string().trim().min(1).max(40).optional(),
  secondaryCtaLabel: z.string().trim().min(1).max(40).optional(),
  secondaryCtaHref: safeInternalHrefSchema.optional(),
  features: z.array(heroFeatureInputSchema).max(4).optional(),
});

function parseHeroSlide(item: HeroCmsSectionItemRow): HomepageHeroSlide | null {
  const settings = heroItemSettingsSchema.safeParse(item.settings);
  const safeSettings = settings.success ? settings.data : {};
  const primaryHref = item.href ?? "/";

  const parsed = heroSlideInputSchema.safeParse({
    id: item.item_key ?? item.id,
    title: item.title,
    subtitle: item.subtitle ?? "",
    description: item.body ?? "",
    image: safeSettings.image,
    imageMediaAssetId: item.media_asset_id,
    accentColor: safeSettings.accentColor,
    badgeText: safeSettings.badgeText,
    primaryCtaLabel: safeSettings.primaryCtaLabel,
    primaryCtaHref: primaryHref,
    secondaryCtaLabel: safeSettings.secondaryCtaLabel,
    secondaryCtaHref: safeSettings.secondaryCtaHref ?? primaryHref,
    features: safeSettings.features,
    sortOrder: item.sort_order,
    isEnabled: item.is_enabled,
  });

  if (!parsed.success) {
    return null;
  }

  return {
    ...parsed.data,
    image: item.mediaUrl ?? parsed.data.image,
    fallbackImagePath: parsed.data.image,
    imageMediaAssetId: parsed.data.imageMediaAssetId ?? null,
  };
}

export function toHomepageHeroCarousel(
  section: CmsSectionRow,
  items: HeroCmsSectionItemRow[]
): HomepageHeroCarousel {
  const sectionSettings = heroSectionSettingsSchema.safeParse(section.settings);
  const autoplaySeconds = sectionSettings.success
    ? sectionSettings.data.autoplaySeconds
    : undefined;

  const slides = items
    .map(parseHeroSlide)
    .filter((slide): slide is HomepageHeroSlide => Boolean(slide))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Autoplay still falls back to a safe default when the section settings are
  // missing/invalid. Slide content does NOT fall back: an existing section with
  // zero valid/enabled slides returns an empty list so the storefront hides it.
  // Fallback slides are only used when the section row is missing/unavailable,
  // which the repository handles separately.
  return {
    isEnabled: section.is_enabled,
    autoplaySeconds:
      autoplaySeconds ?? fallbackHomepageHeroCarousel.autoplaySeconds,
    slides,
  };
}

/* -------------------------------------------------------------------------- */
/* Homepage category circles                                                  */
/* -------------------------------------------------------------------------- */

const categoryImagePathSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(
    /^\/images\/categories\/[A-Za-z0-9/_-]+\.(png|jpe?g|webp|avif)$/i,
    "Use a local /images/categories/... path"
  )
  .refine((value) => !value.includes(".."), "Invalid image path");

const categoryHrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(/^\/categories\/[A-Za-z0-9-]+$/, "Use a path like /categories/earbuds");

export const categoryCircleInputSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(80),
    slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, "Slug must be URL safe"),
    href: categoryHrefSchema,
    productCount: z.coerce.number().int().min(0).max(999999),
    image: z.string().trim().max(300),
    imageMediaAssetId: z.string().uuid().nullable().optional(),
    hoverMediaAssetId: z.string().uuid().nullable().optional(),
    sortOrder: z.coerce.number().int().min(0).max(10_000),
    isEnabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.image) {
      const imagePath = categoryImagePathSchema.safeParse(value.image);

      if (!imagePath.success) {
        ctx.addIssue({
          code: "custom",
          path: ["image"],
          message: imagePath.error.issues[0]?.message ?? "Invalid image path",
        });
      }

      return;
    }

    if (!value.imageMediaAssetId) {
      ctx.addIssue({
        code: "custom",
        path: ["image"],
        message: "Select a media asset or add a fallback image path.",
      });
    }
  });

export const homepageCategoryCirclesInputSchema = z.object({
  isEnabled: z.boolean(),
  items: z.array(categoryCircleInputSchema).max(20),
});

export type HomepageCategoryCirclesInput = z.infer<typeof homepageCategoryCirclesInputSchema>;

export function parseHomepageCategoryCirclesForm(formData: FormData) {
  const rawCount = Number(formData.get("itemCount"));
  const itemCount = Number.isFinite(rawCount) ? Math.min(Math.max(rawCount, 0), 20) : 0;

  const items = Array.from({ length: itemCount }, (_, index) => {
    const prefix = `item-${index}-`;
    const read = (field: string) => formData.get(`${prefix}${field}`) as string | null;
    
    return {
      id: read("id") || `cat-${index + 1}`,
      name: read("name") || "",
      slug: read("slug") || "",
      href: read("href") || "",
      productCount: read("productCount"),
      image: read("image") || "",
      imageMediaAssetId: read("imageMediaAssetId") || null,
      hoverMediaAssetId: read("hoverMediaAssetId") || null,
      sortOrder: read("sortOrder"),
      isEnabled: read("isEnabled") === "true",
    };
  });

  return homepageCategoryCirclesInputSchema.safeParse({
    isEnabled: formData.get("isEnabled") === "true",
    items,
  });
}

export const fallbackHomepageCategoryCircles: HomepageCategoryCircles = {
  isEnabled: true,
  items: [
    { id: "cat-1", name: "Earbuds", slug: "earbuds", href: "/categories/earbuds", productCount: 32, fallbackImagePath: "/images/categories/earbuds.png", imageUrl: "/images/categories/earbuds.png", imageAlt: "Earbuds Category", imageMediaAssetId: null, hoverMediaUrl: null, hoverMediaMimeType: null, hoverMediaAssetId: null, sortOrder: 10, isEnabled: true },
    { id: "cat-2", name: "Neckbands", slug: "neckbands", href: "/categories/neckbands", productCount: 25, fallbackImagePath: "/images/categories/neckbands.png", imageUrl: "/images/categories/neckbands.png", imageAlt: "Neckbands Category", imageMediaAssetId: null, hoverMediaUrl: null, hoverMediaMimeType: null, hoverMediaAssetId: null, sortOrder: 20, isEnabled: true },
    { id: "cat-3", name: "Smart Watch", slug: "smart-watches", href: "/categories/smart-watches", productCount: 1, fallbackImagePath: "/images/categories/watches.png", imageUrl: "/images/categories/watches.png", imageAlt: "Smart Watch Category", imageMediaAssetId: null, hoverMediaUrl: null, hoverMediaMimeType: null, hoverMediaAssetId: null, sortOrder: 30, isEnabled: true },
    { id: "cat-4", name: "Power Banks", slug: "power-banks", href: "/categories/power-banks", productCount: 1, fallbackImagePath: "/images/categories/powerbanks.png", imageUrl: "/images/categories/powerbanks.png", imageAlt: "Power Banks Category", imageMediaAssetId: null, hoverMediaUrl: null, hoverMediaMimeType: null, hoverMediaAssetId: null, sortOrder: 40, isEnabled: true },
    { id: "cat-5", name: "Bluetooth Speaker", slug: "bluetooth-speakers", href: "/categories/bluetooth-speakers", productCount: 1, fallbackImagePath: "/images/categories/speakers.png", imageUrl: "/images/categories/speakers.png", imageAlt: "Bluetooth Speaker Category", imageMediaAssetId: null, hoverMediaUrl: null, hoverMediaMimeType: null, hoverMediaAssetId: null, sortOrder: 50, isEnabled: true },
    { id: "cat-6", name: "Data Cable", slug: "data-cables", href: "/categories/data-cables", productCount: 34, fallbackImagePath: "/images/categories/cables.png", imageUrl: "/images/categories/cables.png", imageAlt: "Data Cable Category", imageMediaAssetId: null, hoverMediaUrl: null, hoverMediaMimeType: null, hoverMediaAssetId: null, sortOrder: 60, isEnabled: true },
  ],
};

const categoryItemSettingsSchema = z.object({
  slug: z.string().optional(),
  productCount: z.number().int().optional(),
  image: z.string().optional(),
  hoverMediaAssetId: z.string().uuid().nullable().optional(),
});

export type CategoryCmsSectionItemRow = CmsSectionItemRow & {
  media_asset_id?: string | null;
  mediaUrl?: string | null;
  mediaMimeType?: string | null;
  hoverMediaUrl?: string | null;
  hoverMediaMimeType?: string | null;
};

function parseCategoryCircle(item: CategoryCmsSectionItemRow): HomepageCategoryCircle | null {
  const settings = categoryItemSettingsSchema.safeParse(item.settings);
  const safeSettings = settings.success ? settings.data : {};

  const parsed = categoryCircleInputSchema.safeParse({
    id: item.item_key ?? item.id,
    name: item.title,
    slug: safeSettings.slug ?? "",
    href: item.href ?? "",
    productCount: safeSettings.productCount ?? 0,
    image: safeSettings.image ?? "",
    imageMediaAssetId: item.media_asset_id ?? null,
    hoverMediaAssetId: safeSettings.hoverMediaAssetId ?? null,
    sortOrder: item.sort_order,
    isEnabled: item.is_enabled,
  });

  if (!parsed.success) {
    return null;
  }

  const imageUrl = item.mediaUrl ?? parsed.data.image;
  if (!imageUrl) {
    return null;
  }

  return {
    id: parsed.data.id,
    name: parsed.data.name,
    slug: parsed.data.slug,
    href: parsed.data.href,
    productCount: parsed.data.productCount,
    fallbackImagePath: parsed.data.image,
    imageUrl,
    imageAlt: `${parsed.data.name} Category`,
    imageMediaAssetId: parsed.data.imageMediaAssetId ?? null,
    hoverMediaUrl: item.hoverMediaUrl ?? null,
    hoverMediaMimeType: item.hoverMediaMimeType ?? null,
    hoverMediaAssetId: parsed.data.hoverMediaAssetId ?? null,
    sortOrder: parsed.data.sortOrder,
    isEnabled: parsed.data.isEnabled,
  };
}

export function toHomepageCategoryCircles(
  section: CmsSectionRow,
  items: CategoryCmsSectionItemRow[]
): HomepageCategoryCircles {
  const validItems = items
    .map(parseCategoryCircle)
    .filter((circle): circle is HomepageCategoryCircle => Boolean(circle))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    isEnabled: section.is_enabled,
    items: validItems,
  };
}

/* -------------------------------------------------------------------------- */
/* Shared homepage media/href helpers                                         */
/* -------------------------------------------------------------------------- */

// Local image assets under public/images, with a known image extension.
const homepageLocalImageSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(
    /^\/images\/[A-Za-z0-9/_-]+\.(png|jpe?g|webp|avif)$/i,
    "Use a local /images/... path"
  )
  .refine((value) => !value.includes(".."), "Invalid image path");

// Internal hrefs that may be empty (optional CTA). Non-empty values must be a
// single-slash internal path so external/protocol-relative URLs cannot pass.
const optionalInternalHrefSchema = z
  .string()
  .trim()
  .max(300)
  .refine(
    (value) => value === "" || /^\/(?!\/)\S*$/.test(value),
    "Use an internal path starting with /."
  );

/* -------------------------------------------------------------------------- */
/* Homepage bento gallery                                                     */
/* -------------------------------------------------------------------------- */

const bentoTileTypeSchema = z
  .enum(["product", "banner", "story", "category"])
  .catch("product");
const bentoLayoutSchema = z
  .enum(["large", "wide", "tall", "standard"])
  .catch("standard");

export const bentoItemInputSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(80),
    subtitle: z.string().trim().max(120),
    body: z.string().trim().max(280),
    href: safeInternalHrefSchema,
    tileType: bentoTileTypeSchema,
    layout: bentoLayoutSchema,
    badgeText: z.string().trim().max(40),
    accentColor: hexColorSchema,
    ctaLabel: z.string().trim().max(40),
    image: z.string().trim().max(300),
    imageMediaAssetId: z.string().uuid().nullable().optional(),
    sortOrder: z.coerce.number().int().min(0).max(10_000),
    isEnabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.image) {
      const imagePath = homepageLocalImageSchema.safeParse(value.image);
      if (!imagePath.success) {
        ctx.addIssue({
          code: "custom",
          path: ["image"],
          message: imagePath.error.issues[0]?.message ?? "Invalid image path",
        });
      }
      return;
    }

    if (!value.imageMediaAssetId) {
      ctx.addIssue({
        code: "custom",
        path: ["image"],
        message: "Select a media asset or add a fallback image path.",
      });
    }
  });

export const homepageBentoGalleryInputSchema = z.object({
  isEnabled: z.boolean(),
  eyebrow: z.string().trim().max(60),
  heading: z.string().trim().max(80),
  description: z.string().trim().max(200),
  items: z.array(bentoItemInputSchema).max(12),
});

export type HomepageBentoGalleryInput = z.infer<
  typeof homepageBentoGalleryInputSchema
>;

export function parseHomepageBentoGalleryForm(formData: FormData) {
  const rawCount = Number(formData.get("itemCount"));
  const itemCount = Number.isFinite(rawCount)
    ? Math.min(Math.max(rawCount, 0), 12)
    : 0;

  const items = Array.from({ length: itemCount }, (_, index) => {
    const prefix = `item-${index}-`;
    const read = (field: string) => formData.get(`${prefix}${field}`) as string | null;

    return {
      id: read("id") || `bento-${index + 1}`,
      title: read("title") || "",
      subtitle: read("subtitle") || "",
      body: read("body") || "",
      href: read("href") || "",
      tileType: read("tileType") || "product",
      layout: read("layout") || "standard",
      badgeText: read("badgeText") || "",
      accentColor: read("accentColor") || "#f97316",
      ctaLabel: read("ctaLabel") || "",
      image: read("image") || "",
      imageMediaAssetId: read("imageMediaAssetId") || null,
      sortOrder: read("sortOrder"),
      isEnabled: read("isEnabled") === "true",
    };
  });

  return homepageBentoGalleryInputSchema.safeParse({
    isEnabled: formData.get("isEnabled") === "true",
    eyebrow: formData.get("eyebrow") ?? "",
    heading: formData.get("heading") ?? "",
    description: formData.get("description") ?? "",
    items,
  });
}

export const fallbackHomepageBentoGallery: HomepageBentoGallery = {
  isEnabled: true,
  eyebrow: "GALLERY SHOWCASE",
  heading: "Engineered Ecosystem",
  description: "",
  items: [
    {
      id: "bento-1",
      title: "AeroStrike HD",
      subtitle: "Commercial Quadcopter",
      body: "Equipped with dual GPS tracking, 4K camera gimbal, and 40-minute flight cells.",
      href: "/products/uag-aerostrike-hd-camera-drone",
      tileType: "product",
      layout: "tall",
      badgeText: "Air-Tech",
      accentColor: "#f97316",
      ctaLabel: "View Product",
      fallbackImagePath: "/images/products/drone.png",
      imageUrl: "/images/products/drone.png",
      imageAlt: "AeroStrike HD",
      imageMediaAssetId: null,
      sortOrder: 10,
      isEnabled: true,
    },
    {
      id: "bento-2",
      title: "CYBER AUDIO LABS",
      subtitle: "Tactical Pro Gaming Essentials",
      body: "Engineered for immersive low-latency gameplay and crystal clear team communication.",
      href: "/products/uag-crystal-gaming-anc",
      tileType: "banner",
      layout: "wide",
      badgeText: "Studio Pro",
      accentColor: "#f59e0b",
      ctaLabel: "Shop Audio",
      fallbackImagePath: "/images/carousel/banner1.png",
      imageUrl: "/images/carousel/banner1.png",
      imageAlt: "CYBER AUDIO LABS",
      imageMediaAssetId: null,
      sortOrder: 20,
      isEnabled: true,
    },
    {
      id: "bento-3",
      title: "Vital Smartwatch",
      subtitle: "Rugged Health Trackers",
      body: "Built-in GPS, 24/7 heart rate and SpO2 monitoring in a mil-grade IP68 chassis.",
      href: "/products/uag-elite-gps-sports-smartwatch",
      tileType: "product",
      layout: "standard",
      badgeText: "GPS Call",
      accentColor: "#10b981",
      ctaLabel: "View Product",
      fallbackImagePath: "/images/categories/watches.png",
      imageUrl: "/images/categories/watches.png",
      imageAlt: "Vital Smartwatch",
      imageMediaAssetId: null,
      sortOrder: 30,
      isEnabled: true,
    },
    {
      id: "bento-5",
      title: "OMNI SOUNDSTAGE",
      subtitle: "Ambient Audio Projection",
      body: "Heavy subwoofers with sync LED lights, optimized for wide outdoor acoustics.",
      href: "/products/uag-omnisound-portable-speaker",
      tileType: "banner",
      layout: "wide",
      badgeText: "IPX7 Sound",
      accentColor: "#ef4444",
      ctaLabel: "Shop Speakers",
      fallbackImagePath: "/images/carousel/banner2.png",
      imageUrl: "/images/carousel/banner2.png",
      imageAlt: "OMNI SOUNDSTAGE",
      imageMediaAssetId: null,
      sortOrder: 50,
      isEnabled: true,
    },
  ],
};

const bentoSectionSettingsSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  description: z.string().optional(),
});

const bentoItemSettingsSchema = z.object({
  localImagePath: z.string().optional(),
  tileType: bentoTileTypeSchema.optional(),
  layout: bentoLayoutSchema.optional(),
  badgeText: z.string().optional(),
  accentColor: hexColorSchema.optional(),
  ctaLabel: z.string().optional(),
});

export type BentoCmsSectionItemRow = CmsSectionItemRow & {
  subtitle?: string | null;
  body?: string | null;
  media_asset_id?: string | null;
  mediaUrl?: string | null;
};

function parseBentoItem(item: BentoCmsSectionItemRow): HomepageBentoItem | null {
  const settings = bentoItemSettingsSchema.safeParse(item.settings);
  const safeSettings = settings.success ? settings.data : {};

  const parsed = bentoItemInputSchema.safeParse({
    id: item.item_key ?? item.id,
    title: item.title,
    subtitle: item.subtitle ?? "",
    body: item.body ?? "",
    href: item.href ?? "",
    tileType: safeSettings.tileType ?? "product",
    layout: safeSettings.layout ?? "standard",
    badgeText: safeSettings.badgeText ?? "",
    accentColor: safeSettings.accentColor ?? "#f97316",
    ctaLabel: safeSettings.ctaLabel ?? "",
    image: safeSettings.localImagePath ?? "",
    imageMediaAssetId: item.media_asset_id ?? null,
    sortOrder: item.sort_order,
    isEnabled: item.is_enabled,
  });

  if (!parsed.success) {
    return null;
  }

  const imageUrl = item.mediaUrl ?? parsed.data.image;
  if (!imageUrl) {
    return null;
  }

  return {
    id: parsed.data.id,
    title: parsed.data.title,
    subtitle: parsed.data.subtitle,
    body: parsed.data.body,
    href: parsed.data.href,
    tileType: parsed.data.tileType,
    layout: parsed.data.layout,
    badgeText: parsed.data.badgeText,
    accentColor: parsed.data.accentColor,
    ctaLabel: parsed.data.ctaLabel,
    fallbackImagePath: parsed.data.image,
    imageUrl,
    imageAlt: parsed.data.title,
    imageMediaAssetId: parsed.data.imageMediaAssetId ?? null,
    sortOrder: parsed.data.sortOrder,
    isEnabled: parsed.data.isEnabled,
  };
}

export function toHomepageBentoGallery(
  section: CmsSectionRow,
  items: BentoCmsSectionItemRow[]
): HomepageBentoGallery {
  const sectionSettings = bentoSectionSettingsSchema.safeParse(section.settings);
  const safe = sectionSettings.success ? sectionSettings.data : {};

  const validItems = items
    .map(parseBentoItem)
    .filter((tile): tile is HomepageBentoItem => Boolean(tile))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    isEnabled: section.is_enabled,
    eyebrow: safe.eyebrow ?? fallbackHomepageBentoGallery.eyebrow,
    heading: safe.heading ?? fallbackHomepageBentoGallery.heading,
    description: safe.description ?? fallbackHomepageBentoGallery.description,
    items: validItems,
  };
}

/* -------------------------------------------------------------------------- */
/* Homepage merchandising banners                                             */
/* -------------------------------------------------------------------------- */

export const merchandisingSlideInputSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(80),
    subtitle: z.string().trim().max(120),
    body: z.string().trim().max(280),
    badgeText: z.string().trim().max(40),
    accentColor: hexColorSchema,
    primaryCtaLabel: z.string().trim().min(1).max(40),
    primaryCtaHref: safeInternalHrefSchema,
    secondaryCtaLabel: z.string().trim().max(40),
    secondaryCtaHref: optionalInternalHrefSchema,
    features: z.array(heroFeatureInputSchema).max(4),
    image: z.string().trim().max(300),
    imageMediaAssetId: z.string().uuid().nullable().optional(),
    sortOrder: z.coerce.number().int().min(0).max(10_000),
    isEnabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.image) {
      const imagePath = homepageLocalImageSchema.safeParse(value.image);
      if (!imagePath.success) {
        ctx.addIssue({
          code: "custom",
          path: ["image"],
          message: imagePath.error.issues[0]?.message ?? "Invalid image path",
        });
      }
      return;
    }

    if (!value.imageMediaAssetId) {
      ctx.addIssue({
        code: "custom",
        path: ["image"],
        message: "Select a media asset or add a fallback image path.",
      });
    }
  });

export const homepageMerchandisingBannersInputSchema = z.object({
  isEnabled: z.boolean(),
  eyebrow: z.string().trim().max(60),
  autoplaySeconds: z.coerce.number().int().min(3).max(30),
  slides: z.array(merchandisingSlideInputSchema).max(8),
});

export type HomepageMerchandisingBannersInput = z.infer<
  typeof homepageMerchandisingBannersInputSchema
>;

export function parseHomepageMerchandisingBannersForm(formData: FormData) {
  const rawCount = Number(formData.get("itemCount"));
  const slideCount = Number.isFinite(rawCount)
    ? Math.min(Math.max(rawCount, 0), 8)
    : 0;

  const slides = Array.from({ length: slideCount }, (_, index) => {
    const prefix = `item-${index}-`;
    const read = (field: string) => formData.get(`${prefix}${field}`) as string | null;

    const features = [
      { text: read("feature1"), icon: read("feature1Icon") },
      { text: read("feature2"), icon: read("feature2Icon") },
    ]
      .filter((feature) => typeof feature.text === "string" && feature.text.trim())
      .map((feature) => ({ text: feature.text, icon: feature.icon }));

    return {
      id: read("id") || `slide-${index + 1}`,
      title: read("title") || "",
      subtitle: read("subtitle") || "",
      body: read("body") || "",
      badgeText: read("badgeText") || "",
      accentColor: read("accentColor") || "#f59e0b",
      primaryCtaLabel: read("primaryCtaLabel") || "",
      primaryCtaHref: read("primaryCtaHref") || "",
      secondaryCtaLabel: read("secondaryCtaLabel") || "",
      secondaryCtaHref: read("secondaryCtaHref") || "",
      features,
      image: read("image") || "",
      imageMediaAssetId: read("imageMediaAssetId") || null,
      sortOrder: read("sortOrder"),
      isEnabled: read("isEnabled") === "true",
    };
  });

  return homepageMerchandisingBannersInputSchema.safeParse({
    isEnabled: formData.get("isEnabled") === "true",
    eyebrow: formData.get("eyebrow") ?? "",
    autoplaySeconds: formData.get("autoplaySeconds"),
    slides,
  });
}

export const fallbackHomepageMerchandisingBanners: HomepageMerchandisingBanners = {
  isEnabled: true,
  eyebrow: "EXCLUSIVE LAUNCH",
  autoplaySeconds: 7,
  slides: [
    {
      id: "slide-1",
      title: "EARBUDS 300 PRO",
      subtitle: "Cybernetic Sound & Hybrid ANC",
      body: "Premium active noise cancellation and thumping dual bass drivers in a rugged tactical chassis with LED charge display.",
      badgeText: "EXCLUSIVE LAUNCH",
      accentColor: "#fbbf24",
      primaryCtaLabel: "Buy Now",
      primaryCtaHref: "/categories/earbuds",
      secondaryCtaLabel: "Specifications",
      secondaryCtaHref: "/categories/earbuds",
      features: [
        { text: "40dB Hybrid ANC", icon: "volume" },
        { text: "BassBoost Driver", icon: "sparkles" },
      ],
      fallbackImagePath: "/images/carousel/banner1.png",
      imageUrl: "/images/carousel/banner1.png",
      imageAlt: "EARBUDS 300 PRO",
      imageMediaAssetId: null,
      sortOrder: 10,
      isEnabled: true,
    },
    {
      id: "slide-2",
      title: "OMNI SPEAKER BEAT",
      subtitle: "High Definition Audio & Light Sync",
      body: "Double subwoofers deliver cinematic, room-filling sound. IPX7 chassis with customizable dual LED ring visualizers.",
      badgeText: "EXCLUSIVE LAUNCH",
      accentColor: "#ef4444",
      primaryCtaLabel: "Buy Now",
      primaryCtaHref: "/categories/bluetooth-speakers",
      secondaryCtaLabel: "Specifications",
      secondaryCtaHref: "/categories/bluetooth-speakers",
      features: [
        { text: "Rich Stereo System", icon: "volume" },
        { text: "Reactive Ambient Glow", icon: "sparkles" },
      ],
      fallbackImagePath: "/images/carousel/banner2.png",
      imageUrl: "/images/carousel/banner2.png",
      imageAlt: "OMNI SPEAKER BEAT",
      imageMediaAssetId: null,
      sortOrder: 20,
      isEnabled: true,
    },
    {
      id: "slide-3",
      title: "TACTICAL WATCH V2",
      subtitle: "Military Spec Biometric Watch",
      body: "Real-time heart rate, body temperature scanning, GPS tracker, and a 30-day battery cell built for extreme conditions.",
      badgeText: "EXCLUSIVE LAUNCH",
      accentColor: "#34d399",
      primaryCtaLabel: "Buy Now",
      primaryCtaHref: "/categories/smart-watches",
      secondaryCtaLabel: "Specifications",
      secondaryCtaHref: "/categories/smart-watches",
      features: [
        { text: "Biometric Tracking", icon: "cpu" },
        { text: "Mil-Spec Durability", icon: "shield" },
      ],
      fallbackImagePath: "/images/carousel/banner1.png",
      imageUrl: "/images/carousel/banner1.png",
      imageAlt: "TACTICAL WATCH V2",
      imageMediaAssetId: null,
      sortOrder: 30,
      isEnabled: true,
    },
  ],
};

const merchSectionSettingsSchema = z.object({
  autoplaySeconds: z.coerce.number().int().min(3).max(30).optional(),
  eyebrow: z.string().optional(),
});

const merchItemSettingsSchema = z.object({
  localImagePath: z.string().optional(),
  badgeText: z.string().optional(),
  accentColor: hexColorSchema.optional(),
  primaryCtaLabel: z.string().optional(),
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaHref: z.string().optional(),
  features: z.array(heroFeatureInputSchema).max(4).optional(),
});

export type MerchCmsSectionItemRow = CmsSectionItemRow & {
  subtitle?: string | null;
  body?: string | null;
  media_asset_id?: string | null;
  mediaUrl?: string | null;
};

function parseMerchandisingSlide(
  item: MerchCmsSectionItemRow
): HomepageMerchandisingSlide | null {
  const settings = merchItemSettingsSchema.safeParse(item.settings);
  const safeSettings = settings.success ? settings.data : {};
  const primaryHref = item.href ?? "/";

  const parsed = merchandisingSlideInputSchema.safeParse({
    id: item.item_key ?? item.id,
    title: item.title,
    subtitle: item.subtitle ?? "",
    body: item.body ?? "",
    badgeText: safeSettings.badgeText ?? "",
    accentColor: safeSettings.accentColor ?? "#f59e0b",
    primaryCtaLabel: safeSettings.primaryCtaLabel ?? "Shop Now",
    primaryCtaHref: primaryHref,
    secondaryCtaLabel: safeSettings.secondaryCtaLabel ?? "",
    secondaryCtaHref: safeSettings.secondaryCtaHref ?? "",
    features: safeSettings.features ?? [],
    image: safeSettings.localImagePath ?? "",
    imageMediaAssetId: item.media_asset_id ?? null,
    sortOrder: item.sort_order,
    isEnabled: item.is_enabled,
  });

  if (!parsed.success) {
    return null;
  }

  return {
    id: parsed.data.id,
    title: parsed.data.title,
    subtitle: parsed.data.subtitle,
    body: parsed.data.body,
    badgeText: parsed.data.badgeText,
    accentColor: parsed.data.accentColor,
    primaryCtaLabel: parsed.data.primaryCtaLabel,
    primaryCtaHref: parsed.data.primaryCtaHref,
    secondaryCtaLabel: parsed.data.secondaryCtaLabel,
    secondaryCtaHref: parsed.data.secondaryCtaHref,
    features: parsed.data.features as HeroSlideFeature[],
    fallbackImagePath: parsed.data.image,
    imageUrl: item.mediaUrl ?? parsed.data.image,
    imageAlt: parsed.data.title,
    imageMediaAssetId: parsed.data.imageMediaAssetId ?? null,
    sortOrder: parsed.data.sortOrder,
    isEnabled: parsed.data.isEnabled,
  };
}

export function toHomepageMerchandisingBanners(
  section: CmsSectionRow,
  items: MerchCmsSectionItemRow[]
): HomepageMerchandisingBanners {
  const sectionSettings = merchSectionSettingsSchema.safeParse(section.settings);
  const safe = sectionSettings.success ? sectionSettings.data : {};

  const validSlides = items
    .map(parseMerchandisingSlide)
    .filter((slide): slide is HomepageMerchandisingSlide => Boolean(slide))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    isEnabled: section.is_enabled,
    eyebrow: safe.eyebrow ?? fallbackHomepageMerchandisingBanners.eyebrow,
    autoplaySeconds:
      safe.autoplaySeconds ?? fallbackHomepageMerchandisingBanners.autoplaySeconds,
    slides: validSlides,
  };
}

/* -------------------------------------------------------------------------- */
/* Site footer                                                                */
/* -------------------------------------------------------------------------- */

const footerHrefSchema = z.union([
  safeInternalHrefSchema,
  z
    .string()
    .trim()
    .min(1)
    .max(300)
    .url()
    .regex(/^https?:\/\//, "Use http or https links only."),
]);

const footerLinkGroupSchema = z
  .enum(["primary", "secondary"])
  .catch("primary");

const footerSocialPlatformSchema = z
  .enum(["facebook", "instagram", "youtube", "x", "linkedin", "custom"])
  .catch("custom");

export const siteFooterLinkInputSchema = z.object({
  id: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(60),
  href: footerHrefSchema,
  group: footerLinkGroupSchema,
  sortOrder: z.coerce.number().int().min(0).max(10_000),
  isEnabled: z.boolean(),
});

export const siteFooterSocialLinkInputSchema = z.object({
  id: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(40),
  href: footerHrefSchema,
  platform: footerSocialPlatformSchema,
  backgroundColor: hexColorSchema,
  sortOrder: z.coerce.number().int().min(0).max(10_000),
  isEnabled: z.boolean(),
});

export const siteFooterInputSchema = z.object({
  isEnabled: z.boolean(),
  logoPath: homepageLocalImageSchema,
  logoAlt: z.string().trim().min(1).max(80),
  copyrightText: z.string().trim().min(1).max(140),
  links: z.array(siteFooterLinkInputSchema).max(12),
  socialLinks: z.array(siteFooterSocialLinkInputSchema).max(8),
});

export type SiteFooterInput = z.infer<typeof siteFooterInputSchema>;

export function parseSiteFooterForm(formData: FormData) {
  const rawLinkCount = Number(formData.get("linkCount"));
  const linkCount = Number.isFinite(rawLinkCount)
    ? Math.min(Math.max(rawLinkCount, 0), 12)
    : 0;

  const rawSocialCount = Number(formData.get("socialCount"));
  const socialCount = Number.isFinite(rawSocialCount)
    ? Math.min(Math.max(rawSocialCount, 0), 8)
    : 0;

  const links = Array.from({ length: linkCount }, (_, index) => {
    const prefix = `link-${index}-`;
    const read = (field: string) => formData.get(`${prefix}${field}`) as string | null;

    return {
      id: read("id") || `footer-link-${index + 1}`,
      label: read("label") || "",
      href: read("href") || "",
      group: read("group") || "primary",
      sortOrder: read("sortOrder"),
      isEnabled: read("isEnabled") === "true",
    };
  });

  const socialLinks = Array.from({ length: socialCount }, (_, index) => {
    const prefix = `social-${index}-`;
    const read = (field: string) => formData.get(`${prefix}${field}`) as string | null;

    return {
      id: read("id") || `footer-social-${index + 1}`,
      label: read("label") || "",
      href: read("href") || "",
      platform: read("platform") || "custom",
      backgroundColor: read("backgroundColor") || "#18181b",
      sortOrder: read("sortOrder"),
      isEnabled: read("isEnabled") === "true",
    };
  });

  return siteFooterInputSchema.safeParse({
    isEnabled: formData.get("isEnabled") === "true",
    logoPath: formData.get("logoPath"),
    logoAlt: formData.get("logoAlt"),
    copyrightText: formData.get("copyrightText"),
    links,
    socialLinks,
  });
}

export const fallbackSiteFooter: SiteFooterContent = {
  isEnabled: true,
  logoPath: "/images/logo/logo.png",
  logoAlt: "UAG Logo",
  copyrightText: "UAG URBN ARMOUR GEAR Copyright 2026",
  links: [
    {
      id: "about-us",
      label: "ABOUT US",
      href: "/about-us",
      group: "primary",
      sortOrder: 10,
      isEnabled: true,
    },
    {
      id: "contact-us",
      label: "CONTACT US",
      href: "/contact-us",
      group: "primary",
      sortOrder: 20,
      isEnabled: true,
    },
    {
      id: "privacy-policy",
      label: "PRIVACY POLICY",
      href: "/privacy-policy",
      group: "primary",
      sortOrder: 30,
      isEnabled: true,
    },
    {
      id: "return-policy",
      label: "RETURN OR REFUND POLICY",
      href: "/return-policy",
      group: "primary",
      sortOrder: 40,
      isEnabled: true,
    },
    {
      id: "shipping-policy",
      label: "SHIPPING POLICY",
      href: "/shipping-policy",
      group: "primary",
      sortOrder: 50,
      isEnabled: true,
    },
    {
      id: "terms-conditions",
      label: "TERMS & CONDITIONS",
      href: "/terms-conditions",
      group: "primary",
      sortOrder: 60,
      isEnabled: true,
    },
    {
      id: "blogs",
      label: "BLOGS",
      href: "/blogs",
      group: "secondary",
      sortOrder: 70,
      isEnabled: true,
    },
    {
      id: "faqs",
      label: "FAQ",
      href: "/faqs",
      group: "secondary",
      sortOrder: 80,
      isEnabled: true,
    },
  ],
  socialLinks: [
    {
      id: "facebook",
      label: "Facebook",
      href: "https://facebook.com",
      platform: "facebook",
      backgroundColor: "#3b5998",
      sortOrder: 10,
      isEnabled: true,
    },
    {
      id: "instagram",
      label: "Instagram",
      href: "https://instagram.com",
      platform: "instagram",
      backgroundColor: "#d946ef",
      sortOrder: 20,
      isEnabled: true,
    },
    {
      id: "youtube",
      label: "YouTube",
      href: "https://youtube.com",
      platform: "youtube",
      backgroundColor: "#c4302b",
      sortOrder: 30,
      isEnabled: true,
    },
  ],
};

const footerSectionSettingsSchema = z.object({
  logoPath: z.string().optional(),
  logoAlt: z.string().optional(),
  copyrightText: z.string().optional(),
});

const footerItemSettingsSchema = z.object({
  kind: z.enum(["link", "social"]).optional(),
  group: footerLinkGroupSchema.optional(),
  platform: footerSocialPlatformSchema.optional(),
  backgroundColor: hexColorSchema.optional(),
});

export type SiteFooterCmsSectionItemRow = CmsSectionItemRow;

function parseSiteFooterLink(item: SiteFooterCmsSectionItemRow): SiteFooterLink | null {
  const settings = footerItemSettingsSchema.safeParse(item.settings);
  const safeSettings = settings.success ? settings.data : {};

  if (safeSettings.kind !== "link") {
    return null;
  }

  const parsed = siteFooterLinkInputSchema.safeParse({
    id: item.item_key ?? item.id,
    label: item.title,
    href: item.href ?? "",
    group: safeSettings.group ?? "primary",
    sortOrder: item.sort_order,
    isEnabled: item.is_enabled,
  });

  return parsed.success ? parsed.data : null;
}

function parseSiteFooterSocialLink(
  item: SiteFooterCmsSectionItemRow
): SiteFooterSocialLink | null {
  const settings = footerItemSettingsSchema.safeParse(item.settings);
  const safeSettings = settings.success ? settings.data : {};

  if (safeSettings.kind !== "social") {
    return null;
  }

  const parsed = siteFooterSocialLinkInputSchema.safeParse({
    id: item.item_key ?? item.id,
    label: item.title,
    href: item.href ?? "",
    platform: safeSettings.platform ?? "custom",
    backgroundColor: safeSettings.backgroundColor ?? "#18181b",
    sortOrder: item.sort_order,
    isEnabled: item.is_enabled,
  });

  return parsed.success ? parsed.data : null;
}

export function toSiteFooter(
  section: CmsSectionRow,
  items: SiteFooterCmsSectionItemRow[]
): SiteFooterContent {
  const settings = footerSectionSettingsSchema.safeParse(section.settings);
  const safeSettings = settings.success ? settings.data : {};
  const logoPath = homepageLocalImageSchema.safeParse(safeSettings.logoPath);

  const links = items
    .map(parseSiteFooterLink)
    .filter((link): link is SiteFooterLink => Boolean(link))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const socialLinks = items
    .map(parseSiteFooterSocialLink)
    .filter((link): link is SiteFooterSocialLink => Boolean(link))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    isEnabled: section.is_enabled,
    logoPath: logoPath.success ? logoPath.data : fallbackSiteFooter.logoPath,
    logoAlt: safeSettings.logoAlt ?? fallbackSiteFooter.logoAlt,
    copyrightText:
      safeSettings.copyrightText ?? fallbackSiteFooter.copyrightText,
    links,
    socialLinks,
  };
}
