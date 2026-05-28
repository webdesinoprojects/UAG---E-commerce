"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

export default function SiteFooter() {
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="w-full bg-[#080808] border-t border-zinc-950 text-white py-12 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
      <div className="mx-auto max-w-7xl">
        {/* Main Grid: Logo (left), Links (center), Copyright (right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-between gap-8 md:gap-4 pb-8">
          
          {/* Left Column: Custom Styled Brand Logo */}
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="flex flex-col items-start select-none group">
              <span className="text-3xl font-black text-white tracking-tighter leading-none group-hover:text-primary transition-colors">
                UAG
              </span>
              <span className="text-[7px] font-black text-zinc-500 tracking-[0.3em] uppercase leading-none mt-1">
                URBN ARMOUR GEAR
              </span>
            </Link>
          </div>

          {/* Center Column: Links and Social Icons */}
          <div className="flex flex-col items-center text-center gap-6">
            
            {/* Links Block */}
            <div className="flex flex-col gap-2.5 max-w-md">
              {/* Row 1 Links */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                <Link href="/about-us" className="hover:text-white transition-colors">ABOUT US</Link>
                <Link href="/contact-us" className="hover:text-white transition-colors">CONTACT US</Link>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">PRIVACY POLICY</Link>
                <Link href="/return-policy" className="hover:text-white transition-colors">RETURN OR REFUND POLICY</Link>
                <Link href="/shipping-policy" className="hover:text-white transition-colors">SHIPPING POLICY</Link>
                <Link href="/terms-conditions" className="hover:text-white transition-colors">TERMS & CONDITIONS.</Link>
              </div>
              
              {/* Row 2 Links */}
              <div className="flex justify-center gap-4 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                <Link href="/blogs" className="hover:text-white transition-colors">BLOGS</Link>
                <Link href="/faqs" className="hover:text-white transition-colors">FAQ</Link>
              </div>
            </div>

            {/* Social Media Rounded Buttons (Custom SVGs to avoid package version mismatches) */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-8 w-8 flex items-center justify-center bg-[#3b5998] hover:bg-[#3b5998]/90 text-white rounded-lg transition-transform duration-200 active:scale-90"
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current" stroke="none">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-8 w-8 flex items-center justify-center bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:brightness-110 text-white rounded-lg transition-transform duration-200 active:scale-90"
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="h-8 w-8 flex items-center justify-center bg-[#c4302b] hover:bg-[#c4302b]/90 text-white rounded-lg transition-transform duration-200 active:scale-90"
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current" stroke="none">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.003 3.003 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>

          </div>

          {/* Right Column: Copyright */}
          <div className="flex justify-center md:justify-end text-center md:text-right">
            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
              UAG URBN ARMOUR GEAR Copyright ©<br />2026
            </p>
          </div>

        </div>
      </div>

      {/* Floating Scroll-to-Top Button */}
      <button
        onClick={scrollToTop}
        type="button"
        aria-label="Scroll to top"
        className={`fixed bottom-20 md:bottom-6 right-6 z-50 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white border border-zinc-200 text-zinc-950 flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-zinc-100 hover:scale-105 active:scale-95 ${
          isVisible ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-4 scale-90 pointer-events-none"
        }`}
      >
        <ArrowUp className="h-5 w-5 stroke-[2.5]" />
      </button>
    </footer>
  );
}
