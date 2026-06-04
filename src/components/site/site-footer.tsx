"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUp } from "lucide-react";
import type {
  SiteFooterContent,
  SiteFooterSocialPlatform,
} from "@/features/homepage/types";

interface SiteFooterProps {
  footer: SiteFooterContent;
}

function SocialPlatformIcon({
  platform,
}: {
  platform: SiteFooterSocialPlatform;
}) {
  if (platform === "instagram") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4.5 w-4.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }

  if (platform === "youtube") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4.5 w-4.5 fill-current"
        stroke="none"
        aria-hidden="true"
      >
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
      </svg>
    );
  }

  const labelMap: Record<SiteFooterSocialPlatform, string> = {
    facebook: "f",
    instagram: "ig",
    youtube: "yt",
    x: "x",
    linkedin: "in",
    custom: "*",
  };

  return (
    <span className="text-sm font-black uppercase leading-none" aria-hidden="true">
      {labelMap[platform]}
    </span>
  );
}

export default function SiteFooter({ footer }: SiteFooterProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const scrollPercent = (scrollTop / docHeight) * 100;
        setIsVisible(scrollPercent >= 50);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const groupedLinks = useMemo(
    () => ({
      primary: footer.links.filter((link) => link.group === "primary"),
      secondary: footer.links.filter((link) => link.group === "secondary"),
    }),
    [footer.links]
  );

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!footer.isEnabled) {
    return null;
  }

  return (
    <footer className="w-full border-t border-zinc-950 bg-[#080808] px-4 py-12 font-sans text-white animate-fade-in sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center justify-between gap-8 pb-8 md:grid-cols-3 md:gap-4">
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="flex items-start select-none">
              <Image
                src={footer.logoPath}
                alt={footer.logoAlt}
                width={120}
                height={40}
                className="h-10 w-auto object-contain invert mix-blend-screen"
                style={{ width: "auto" }}
                priority
              />
            </Link>
          </div>

          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex max-w-md flex-col gap-2.5">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 sm:text-[10px]">
                {groupedLinks.primary.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {groupedLinks.secondary.length > 0 && (
                <div className="flex justify-center gap-4 text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 sm:text-[10px]">
                  {groupedLinks.secondary.map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      className="transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {footer.socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {footer.socialLinks.map((socialLink) => (
                  <a
                    key={socialLink.id}
                    href={socialLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socialLink.label}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition-transform duration-200 hover:brightness-110 active:scale-90"
                    style={{ backgroundColor: socialLink.backgroundColor }}
                  >
                    <SocialPlatformIcon platform={socialLink.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center text-center md:justify-end md:text-right">
            <p className="text-[9px] font-bold uppercase leading-relaxed tracking-widest text-zinc-500 sm:text-[10px]">
              {footer.copyrightText}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        type="button"
        aria-label="Scroll to top"
        className={`fixed right-6 bottom-20 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-950 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-zinc-100 active:scale-95 sm:h-12 sm:w-12 md:bottom-6 ${
          isVisible
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-90 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5 stroke-[2.5]" />
      </button>
    </footer>
  );
}
