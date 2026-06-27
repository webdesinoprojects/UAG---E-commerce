"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  ChevronDown,
  UserRound,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Custom SVG Icons for categories to ensure compiler stability and crisp rendering
const EarbudsSvg = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const NeckbandSvg = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a8 8 0 0 0-8 8v4c0 3 2 5 5 5h6c3 0 5-2 5-5v-4a8 8 0 0 0-8-8z" />
    <path d="M7 10h10" />
    <circle cx="9" cy="14" r="1" />
    <circle cx="15" cy="14" r="1" />
  </svg>
);

const SpeakerSvg = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <circle cx="12" cy="14" r="4" />
    <line x1="12" y1="6" x2="12.01" y2="6" />
  </svg>
);

const CableSvg = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 12h-5V6h3V2H8v4h3v6H6c-1.1 0-2 .9-2 2v6h16v-6c0-1.1-.9-2-2-2z" />
    <path d="M12 12v10" />
  </svg>
);

const BatterySvg = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
    <line x1="22" y1="11" x2="22" y2="13" />
    <path d="M7 12h4" />
    <path d="M9 10v4" />
  </svg>
);

const WatchSvg = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="7" />
    <polyline points="12 9 12 12 14 12" />
    <path d="M12 5V1" />
    <path d="M12 19v4" />
  </svg>
);

const DroneSvg = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <circle cx="12" cy="4" r="1.5" />
    <circle cx="12" cy="20" r="1.5" />
    <circle cx="4" cy="12" r="1.5" />
    <circle cx="20" cy="12" r="1.5" />
  </svg>
);

const categoryItems = [
  {
    label: "Earbuds",
    href: "/categories/earbuds",
    icon: EarbudsSvg,
  },
  {
    label: "Neckbands",
    href: "/categories/neckbands",
    icon: NeckbandSvg,
  },
  {
    label: "Speakers",
    href: "/categories/speakers",
    icon: SpeakerSvg,
  },
  {
    label: "Data Cables",
    href: "/categories/cables",
    icon: CableSvg,
  },
  {
    label: "Power Banks",
    href: "/categories/powerbanks",
    icon: BatterySvg,
  },
  {
    label: "Smart Watches",
    href: "/categories/smartwatches",
    icon: WatchSvg,
  },
  {
    label: "Drone",
    href: "/categories/drone",
    icon: DroneSvg,
  },
];

const dropdownLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/shipping", label: "Shipping" },
  { href: "/track-order", label: "Track Order" },
  { href: "/faqs", label: "FAQs" },
];

interface SiteHeaderProps {
  isCustomerSignedIn?: boolean;
  cartItemCount?: number;
  cartSubtotalCents?: number;
}

export default function SiteHeader({
  isCustomerSignedIn = false,
  cartItemCount = 0,
  cartSubtotalCents = 0,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"categories" | "store">("categories");
  const accountHref = isCustomerSignedIn ? "/account" : "/auth/login";
  const accountLabel = isCustomerSignedIn ? "My Account" : "Login / Register";
  const isSearchPage = pathname.startsWith("/search");
  const cartTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(cartSubtotalCents / 100);
  const storeItems = [
    { label: "Blog", href: "/blog", hasUserIcon: false },
    { label: "About Us", href: "/about-us", hasUserIcon: false },
    { label: "Contact Us", href: "/contact-us", hasUserIcon: false },
    { label: "Privacy Policy", href: "/privacy-policy", hasUserIcon: false },
    { label: accountLabel, href: accountHref, hasUserIcon: true },
  ];

  return (
    <>
      {/* Standard Header Stretched relative to top viewport */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background transition-shadow duration-300 hover:shadow-sm">
        
        {/* 1. Desktop Navigation Bar Layout (768px+) */}
        <div className="hidden md:flex mx-auto h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left: Brand Logo & Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/images/logo/logo.png"
                alt="UAG Logo"
                width={120}
                height={40}
                className="h-10 w-auto object-contain mix-blend-multiply"
                style={{ width: "auto" }}
                priority
              />
            </Link>

            {/* Desktop Nav links */}
            <nav className="flex items-center gap-1 text-[17px] font-serif tracking-wide">
              <Link
                href="/"
                className={cn(
                  "px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-accent/40",
                  pathname === "/" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Home
              </Link>
              <Link
                href="/categories"
                className={cn(
                  "px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-accent/40",
                  pathname.startsWith("/categories") ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Categories
              </Link>
              <Link
                href="/new-launches"
                className={cn(
                  "px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-accent/40",
                  pathname.startsWith("/new-launches") ? "text-foreground" : "text-muted-foreground"
                )}
              >
                New Launches
              </Link>

              {/* More hover drawer */}
              <div
                className="relative"
                onMouseEnter={() => setIsMoreOpen(true)}
                onMouseLeave={() => setIsMoreOpen(false)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-muted-foreground hover:text-blue-800 hover:bg-zinc-100 rounded-md transition-colors outline-hidden",
                    isMoreOpen ? "bg-zinc-100 text-blue-800" : ""
                  )}
                  aria-expanded={isMoreOpen}
                  aria-haspopup="true"
                >
                  More
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      isMoreOpen ? "rotate-180" : ""
                    )}
                  />
                </button>

                {isMoreOpen ? (
                  <div className="absolute left-0 top-full z-50 w-80 pt-9">
                    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white py-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
                      {dropdownLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMoreOpen(false)}
                          className="block px-8 py-2.5 text-lg font-medium text-zinc-400 transition-colors hover:bg-zinc-950 hover:text-white dark:text-zinc-500 dark:hover:bg-white dark:hover:text-zinc-950"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {isCustomerSignedIn ? (
              <Link
                href="/account"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground",
                  pathname === "/account" ? "text-foreground" : ""
                )}
                aria-label="My account"
                title="My account"
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Login / Register
              </Link>
            )}

            <Link
              href={isSearchPage ? "/" : "/search"}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
              aria-label={isSearchPage ? "Close search" : "Search"}
            >
              {isSearchPage ? (
                <X className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Link>

            {/* Cart Icon indicator */}
            <Link
              href="/cart"
              className="group flex items-center gap-2 rounded-full border border-border/80 bg-background/50 hover:bg-accent/30 py-1.5 px-3.5 transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="absolute -top-2.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {cartItemCount}
                </span>
              </div>
              <span className="text-xs font-bold text-foreground">
                {cartTotal}
              </span>
            </Link>
          </div>
        </div>

        {/* 2. Mobile Navigation Bar Layout (<768px) */}
        <div className="flex md:hidden h-16 w-full items-center justify-between px-4 select-none">
          
          {/* Left: Morphing Hamburger Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="flex items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800 p-2.5 rounded-md bg-transparent focus:outline-hidden"
          >
            {/* Smooth morphing Hamburger to X */}
            <div className="w-5 h-4 flex flex-col justify-between relative">
              <span className={cn(
                "w-full h-0.5 bg-zinc-800 dark:bg-zinc-200 transition-all duration-300 origin-left",
                isOpen ? "rotate-45 translate-x-[3px] -translate-y-[1px]" : ""
              )} />
              <span className={cn(
                "w-full h-0.5 bg-zinc-800 dark:bg-zinc-200 transition-all duration-300",
                isOpen ? "opacity-0" : ""
              )} />
              <span className={cn(
                "w-full h-0.5 bg-zinc-800 dark:bg-zinc-200 transition-all duration-300 origin-left",
                isOpen ? "-rotate-45 translate-x-[3px] translate-y-[1px]" : ""
              )} />
            </div>
          </button>

          {/* Center: Brand Logo */}
          <div className="flex justify-center flex-1">
            <Link href="/" className="flex items-center select-none">
              <Image
                src="/images/logo/logo.png"
                alt="UAG Logo"
                width={100}
                height={32}
                className="h-8 w-auto object-contain mix-blend-multiply"
                style={{ width: "auto" }}
                priority
              />
            </Link>
          </div>

          {/* Right: Colored Circle Social Icons */}
          <div className="flex items-center gap-2">
            {/* Facebook Circle */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="h-8 w-8 flex items-center justify-center bg-[#3b5998] hover:bg-[#3b5998]/90 text-white rounded-full transition-transform duration-205 active:scale-90 shadow-xs"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" stroke="none">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
              </svg>
            </a>
            
            {/* Instagram Circle (Custom Brown Accent matching mobile mockup) */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="h-8 w-8 flex items-center justify-center bg-[#694b37] hover:bg-[#694b37]/90 text-white rounded-full transition-transform duration-205 active:scale-90 shadow-xs"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            
            {/* YouTube Circle */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="h-8 w-8 flex items-center justify-center bg-[#c4302b] hover:bg-[#c4302b]/90 text-white rounded-full transition-transform duration-205 active:scale-90 shadow-xs"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" stroke="none">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.003 3.003 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>

        </div>

      </header>

      {/* 3. Mobile Navigation Slide-Out Drawer Panel (Sibling to header to keep backdrop-filter isolated) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          className="w-full max-w-[320px] bg-white dark:bg-zinc-950 p-0 border-r border-zinc-200 dark:border-zinc-900 flex flex-col h-full focus:outline-hidden"
        >
          <SheetTitle className="sr-only">Mobile Navigation Drawer</SheetTitle>

          {/* Top Search Bar */}
          <div className="py-4 pl-4 pr-14 border-b border-zinc-100 dark:border-zinc-900">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                placeholder="Search for products"
                className="w-full h-11 pl-4 pr-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-primary text-zinc-800 dark:text-zinc-200"
              />
              <Search className="absolute right-3.5 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Navigation Tabs headers */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-900 text-[10px] sm:text-xs font-black tracking-wider select-none bg-zinc-50/50 dark:bg-zinc-900/10">
            <button
              onClick={() => setActiveTab("categories")}
              className={cn(
                "flex-1 py-4 text-center border-b-2 transition-all font-sans duration-200",
                activeTab === "categories"
                  ? "border-blue-600 text-zinc-900 dark:text-white font-black"
                  : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
            >
              CATEGORIES
            </button>
            <button
              onClick={() => setActiveTab("store")}
              className={cn(
                "flex-1 py-4 text-center border-b-2 transition-all font-sans duration-200",
                activeTab === "store"
                  ? "border-blue-600 text-zinc-900 dark:text-white font-black"
                  : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
            >
              TECH-GEAR STORE
            </button>
          </div>

          {/* Scrollable list items panel */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900/60">
            
            {/* CATEGORIES Tab contents */}
            {activeTab === "categories" && categoryItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/20 transition-all duration-150 group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <IconComponent />
                  </div>
                  <span className="text-[15px] font-serif text-zinc-800 dark:text-zinc-300 tracking-wide group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* TECH-GEAR STORE Tab contents */}
            {activeTab === "store" && storeItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3.5 px-5 py-4.5 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/20 transition-all duration-150 group border-b border-zinc-100 dark:border-zinc-900/40"
              >
                {item.hasUserIcon && (
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
                <span className="text-[15px] font-serif text-zinc-800 dark:text-zinc-300 tracking-wide group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </Link>
            ))}

          </div>

        </SheetContent>
      </Sheet>

      {/* 4. Bottom Tab Navigation Bar on Mobile (fixed at bottom of screen, sibling to header to keep position fixed functional) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-45 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 h-16 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)] select-none">
        
        {/* Home Tab */}
        <Link 
          href="/" 
          className={cn(
            "flex flex-col items-center justify-center transition-colors py-1 flex-1 min-w-0",
            pathname === "/" ? "text-primary" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          )}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider font-sans whitespace-nowrap">Home</span>
        </Link>

        {/* Cart Tab with Numeric Indicator */}
        <Link 
          href="/cart" 
          className={cn(
            "flex flex-col items-center justify-center transition-colors py-1 flex-1 min-w-0 relative",
            pathname === "/cart" ? "text-primary" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          )}
        >
          <div className="relative">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[8px] font-black text-white">
              {cartItemCount}
            </span>
          </div>
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider font-sans whitespace-nowrap">Cart</span>
        </Link>

        {/* Track Order Tab */}
        <Link 
          href="/track-order" 
          className={cn(
            "flex flex-col items-center justify-center transition-colors py-1 flex-1 min-w-0",
            pathname === "/track-order" ? "text-primary" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          )}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 17h4V5H2v12h3" />
            <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
            <path d="M14 17h1" />
            <circle cx="7.5" cy="17.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider font-sans whitespace-nowrap">Track</span>
        </Link>

        {/* My Account Tab */}
        <Link 
          href={accountHref} 
          className={cn(
            "flex flex-col items-center justify-center transition-colors py-1 flex-1 min-w-0",
            pathname === "/account" || pathname.startsWith("/auth")
              ? "text-primary"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          )}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider font-sans whitespace-nowrap">
            {isCustomerSignedIn ? "Account" : "Login"}
          </span>
        </Link>

        {/* Menu Tab (Triggers Tech-Gear Store Sidebar Menu) */}
        <button
          onClick={() => {
            setActiveTab("store");
            setIsOpen(true);
          }}
          className={cn(
            "flex flex-col items-center justify-center transition-colors py-1 flex-1 min-w-0 focus:outline-hidden",
            isOpen && activeTab === "store" ? "text-primary" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          )}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider font-sans whitespace-nowrap">Menu</span>
        </button>
      </div>
    </>
  );
}
