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
