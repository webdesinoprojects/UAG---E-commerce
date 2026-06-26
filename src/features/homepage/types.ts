export type AnnouncementIcon = "truck" | "sparkles" | "star";

export interface HomepageAnnouncementItem {
  id: string;
  text: string;
  icon: AnnouncementIcon;
  href: string | null;
  sortOrder: number;
}

export interface HomepageAnnouncement {
  isEnabled: boolean;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  speedSeconds: number;
  items: HomepageAnnouncementItem[];
}

export type HeroFeatureIcon =
  | "volume"
  | "sparkles"
  | "cpu"
  | "shield"
  | "zap"
  | "bluetooth"
  | "link"
  | "check";

export interface HeroSlideFeature {
  text: string;
  icon: HeroFeatureIcon;
}

export interface HomepageHeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  fallbackImagePath: string;
  imageMediaAssetId: string | null;
  accentColor: string;
  badgeText: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  features: HeroSlideFeature[];
  sortOrder: number;
  isEnabled: boolean;
}

export interface HomepageHeroCarousel {
  isEnabled: boolean;
  autoplaySeconds: number;
  slides: HomepageHeroSlide[];
}

export interface HomepageCategoryCircle {
  id: string;
  name: string;
  slug: string;
  href: string;
  productCount: number;
  fallbackImagePath: string;
  imageUrl: string;
  imageAlt: string;
  imageMediaAssetId: string | null;
  hoverMediaUrl: string | null;
  hoverMediaMimeType: string | null;
  hoverMediaAssetId: string | null;
  sortOrder: number;
  isEnabled: boolean;
}

export interface HomepageCategoryCircles {
  isEnabled: boolean;
  items: HomepageCategoryCircle[];
}

export type BentoTileType = "product" | "banner" | "story" | "category";
export type BentoTileLayout = "large" | "wide" | "tall" | "standard";

export interface HomepageBentoItem {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  href: string;
  tileType: BentoTileType;
  layout: BentoTileLayout;
  badgeText: string;
  accentColor: string;
  ctaLabel: string;
  fallbackImagePath: string;
  imageUrl: string;
  imageAlt: string;
  imageMediaAssetId: string | null;
  sortOrder: number;
  isEnabled: boolean;
}

export interface HomepageBentoGallery {
  isEnabled: boolean;
  eyebrow: string;
  heading: string;
  description: string;
  items: HomepageBentoItem[];
}

export interface HomepageMerchandisingSlide {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  badgeText: string;
  accentColor: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  features: HeroSlideFeature[];
  fallbackImagePath: string;
  imageUrl: string;
  imageAlt: string;
  imageMediaAssetId: string | null;
  sortOrder: number;
  isEnabled: boolean;
}

export interface HomepageMerchandisingBanners {
  isEnabled: boolean;
  eyebrow: string;
  autoplaySeconds: number;
  slides: HomepageMerchandisingSlide[];
}

export type SiteFooterLinkGroup = "primary" | "secondary";
export type SiteFooterSocialPlatform =
  | "facebook"
  | "instagram"
  | "youtube"
  | "x"
  | "linkedin"
  | "custom";

export interface SiteFooterLink {
  id: string;
  label: string;
  href: string;
  group: SiteFooterLinkGroup;
  sortOrder: number;
  isEnabled: boolean;
}

export interface SiteFooterSocialLink {
  id: string;
  label: string;
  href: string;
  platform: SiteFooterSocialPlatform;
  backgroundColor: string;
  sortOrder: number;
  isEnabled: boolean;
}

export interface SiteFooterContent {
  isEnabled: boolean;
  logoPath: string;
  logoAlt: string;
  copyrightText: string;
  links: SiteFooterLink[];
  socialLinks: SiteFooterSocialLink[];
}
