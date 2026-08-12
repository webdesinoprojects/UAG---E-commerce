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
        className="h-6 w-6"
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
        className="h-6 w-6 fill-current"
        stroke="none"
        aria-hidden="true"
      >
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
      </svg>
    );
  }

  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M14.2 8.5V6.8c0-.8.5-1 1-1h2.6V1.9L14.2 2c-3.6 0-4.4 2.7-4.4 4.4v2.1H7.5V13h2.3v9h4.4v-9h3.2l.5-4.5h-3.7z" />
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

  const requiredSocialLinks = [
    {
      id: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/people/URBN-ARMR-GEAR/61560946560115/",
      platform: "facebook" as const,
      background: "#3b5998",
    },
    {
      id: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/uag_audio/",
      platform: "instagram" as const,
      background: "linear-gradient(135deg, #feda75 0%, #d62976 50%, #4f5bd5 100%)",
    },
    {
      id: "youtube",
      label: "YouTube",
      href: "https://www.youtube.com/@Uag-Audio",
      platform: "youtube" as const,
      background: "#d71920",
    },
  ];

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
    <footer className="w-full animate-fade-in border-t border-zinc-950 bg-[#0b0b0b] px-4 py-10 font-sans text-white sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-9 md:grid-cols-[160px_minmax(0,1fr)_230px] md:gap-8">
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="flex items-start select-none">
              <Image
                src={footer.logoPath}
                alt={footer.logoAlt}
                width={140}
                height={56}
                className="h-14 w-auto object-contain invert mix-blend-screen"
                style={{ width: "auto" }}
                priority
              />
            </Link>
          </div>

          <div className="flex flex-col items-center gap-12 text-center">
            <div className="flex max-w-4xl flex-col gap-7">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-extrabold uppercase text-zinc-100">
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
                <div className="flex justify-center gap-7 text-sm font-extrabold uppercase text-zinc-100">
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

            <div className="flex items-center gap-2">
                {requiredSocialLinks.map((socialLink) => (
                  <a
                    key={socialLink.id}
                    href={socialLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socialLink.label}
                    className="flex h-14 w-14 items-center justify-center rounded-md text-white transition-transform duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
                    style={{ background: socialLink.background }}
                  >
                    <SocialPlatformIcon platform={socialLink.platform} />
                  </a>
                ))}
            </div>
          </div>

          <div className="flex justify-center text-center md:justify-end md:text-right">
            <p className="max-w-[230px] text-sm font-medium leading-6 text-zinc-300">
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
