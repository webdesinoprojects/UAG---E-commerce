import Link from "next/link";
import { Sparkles, Star, Truck } from "lucide-react";
import type {
  AnnouncementIcon,
  HomepageAnnouncement,
  HomepageAnnouncementItem,
} from "@/features/homepage/types";

const iconMap = {
  sparkles: Sparkles,
  star: Star,
  truck: Truck,
} satisfies Record<AnnouncementIcon, typeof Sparkles>;

interface MarqueeBannerProps {
  announcement: HomepageAnnouncement;
}

function MarqueeItem({
  accentColor,
  item,
}: {
  accentColor: string;
  item: HomepageAnnouncementItem;
}) {
  const Icon = iconMap[item.icon];
  const className =
    "flex items-center gap-4 mx-6 text-xs sm:text-sm font-extrabold tracking-wider text-current uppercase";
  const content = (
    <>
      <Icon
        className="h-4.5 w-4.5 shrink-0"
        style={{ color: accentColor }}
        aria-hidden="true"
      />
      <span>{item.text}</span>
      <span className="ml-4 font-normal opacity-30" aria-hidden="true">
        |
      </span>
    </>
  );

  if (!item.href) {
    return <div className={className}>{content}</div>;
  }

  if (item.href.startsWith("/")) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a href={item.href} className={className} rel="noreferrer noopener">
      {content}
    </a>
  );
}

export default function MarqueeBanner({ announcement }: MarqueeBannerProps) {
  if (!announcement.isEnabled || announcement.items.length === 0) {
    return null;
  }

  const repeatedItems = Array.from(
    { length: 6 },
    () => announcement.items
  ).flat();

  return (
    <div
      className="mt-[25px] w-full overflow-hidden border-y border-white/10 py-3 font-heading select-none relative"
      style={{
        backgroundColor: announcement.backgroundColor,
        color: announcement.textColor,
      }}
    >
      <div
        className="marquee-container marquee-animation"
        style={{ animationDuration: `${announcement.speedSeconds}s` }}
        tabIndex={0}
        aria-label="Promotional Announcement Banner"
      >
        {repeatedItems.map((item, idx) => (
          <MarqueeItem
            key={`${item.id}-${idx}`}
            item={item}
            accentColor={announcement.accentColor}
          />
        ))}
      </div>
    </div>
  );
}
