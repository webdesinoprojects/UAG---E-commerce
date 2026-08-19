import Link from "next/link";
import type {
  AnnouncementIcon,
  HomepageAnnouncement,
  HomepageAnnouncementItem,
} from "@/features/homepage/types";

const iconMap = {
  sparkles: "★",
  star: "★",
  truck: "🚚🚚",
} satisfies Record<AnnouncementIcon, string>;

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
  const icon = iconMap[item.icon];
  const className =
    "flex items-center gap-4 mx-6 text-xs sm:text-sm font-extrabold tracking-wider text-current uppercase";
  const content = (
    <>
      <span
        className="shrink-0 leading-none"
        style={{ color: accentColor }}
        aria-hidden="true"
      >
        {icon}
      </span>
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
      className="relative mx-auto mt-[25px] w-[calc(100%-2rem)] max-w-7xl overflow-hidden rounded-lg border-y border-white/10 py-3 font-heading select-none"
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
