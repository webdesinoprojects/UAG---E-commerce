"use client";

import React, { useState, useMemo } from "react";
import ProductCard, { type Product } from "@/features/catalog/components/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const tabs = [
  { id: "earbuds", label: "EARBUDS" },
  { id: "neckband", label: "NECKBAND" },
  { id: "smartwatch", label: "SMARTWATCH" },
  { id: "powerbank", label: "POWER BANK" },
  { id: "speaker", label: "BLUETOOTH SPEAKER" },
  { id: "cable", label: "DATA CABLE" },
  { id: "drone", label: "DRONE" },
];

const mockProducts: Product[] = [
  // --- EARBUDS ---
  {
    id: "eb-1",
    name: "UAG Crystal Gaming ANC Transparent Deep Bass Earbuds",
    category: "Earbuds Or Airdopes ENC",
    price: 1199,
    originalPrice: 5999,
    discount: 80,
    image: "/images/categories/earbuds.png",
    slug: "uag-crystal-gaming-anc",
  },
  {
    id: "eb-2",
    name: "UAG Crystal Transparent Gaming or ANC Earbuds",
    category: "Earbuds Or Airdopes ENC",
    price: 1189,
    originalPrice: 6999,
    discount: 83,
    image: "/images/categories/earbuds.png",
    slug: "uag-crystal-transparent-gaming",
  },
  {
    id: "eb-3",
    name: "UAG Urbn Armour Gear 151ANC Airdopes",
    category: "Earbuds Or Airdopes ENC",
    price: 1090,
    originalPrice: 2999,
    discount: 64,
    image: "/images/categories/earbuds.png",
    slug: "uag-urbn-armour-151anc",
  },
  {
    id: "eb-4",
    name: "UAG BassSound Guaranteed ANC Mode Airdopes",
    category: "Earbuds Or Airdopes ENC",
    price: 1090,
    originalPrice: 5999,
    discount: 82,
    image: "/images/categories/earbuds.png",
    slug: "uag-bass-sound-guaranteed",
  },
  {
    id: "eb-5",
    name: "UAG Urbn Armour Gear 151ANC Airdopes - White Edition",
    category: "Earbuds Or Airdopes ENC",
    price: 1099,
    originalPrice: 2999,
    discount: 63,
    image: "/images/categories/earbuds.png",
    slug: "uag-urbn-armour-151anc-white",
  },
  {
    id: "eb-6",
    name: "UAG Stealth Active ANC Wireless Earbuds",
    category: "Earbuds Or Airdopes ENC",
    price: 1499,
    originalPrice: 4999,
    discount: 70,
    image: "/images/categories/earbuds.png",
    slug: "uag-stealth-active-anc",
  },
  {
    id: "eb-7",
    name: "UAG CyberPunk Glow Low-Latency Gaming Earbuds",
    category: "Earbuds Or Airdopes ENC",
    price: 1249,
    originalPrice: 4999,
    discount: 75,
    image: "/images/categories/earbuds.png",
    slug: "uag-cyberpunk-glow-gaming",
  },
  {
    id: "eb-8",
    name: "UAG SoundFlow Premium Dynamic Airdopes",
    category: "Earbuds Or Airdopes ENC",
    price: 1999,
    originalPrice: 4999,
    discount: 60,
    image: "/images/categories/earbuds.png",
    slug: "uag-soundflow-premium-dynamic",
  },
  {
    id: "eb-9",
    name: "UAG LitePods Ultra Compact Sport Earbuds",
    category: "Earbuds Or Airdopes ENC",
    price: 899,
    originalPrice: 2599,
    discount: 65,
    image: "/images/categories/earbuds.png",
    slug: "uag-litepods-ultra-compact",
  },
  {
    id: "eb-10",
    name: "UAG ProBass Wireless Bluetooth Studio Buds",
    category: "Earbuds Or Airdopes ENC",
    price: 1399,
    originalPrice: 4999,
    discount: 72,
    image: "/images/categories/earbuds.png",
    slug: "uag-probass-wireless-bluetooth",
  },

  // --- NECKBANDS ---
  {
    id: "nb-1",
    name: "UAG Magnetic Sensor Neckband Pro",
    category: "Neckband with Magnetic Sensor or ENC",
    price: 999,
    originalPrice: 2999,
    discount: 67,
    image: "/images/categories/neckbands.png",
    slug: "uag-magnetic-sensor-neckband-pro",
  },
  {
    id: "nb-2",
    name: "UAG ActiveSport Neckband Bluetooth Headset",
    category: "Neckband with Magnetic Sensor or ENC",
    price: 1199,
    originalPrice: 2999,
    discount: 60,
    image: "/images/categories/neckbands.png",
    slug: "uag-activesport-neckband-bluetooth",
  },
  {
    id: "nb-3",
    name: "UAG Airdopes Band ENC Heavy Bass Earphones",
    category: "Neckband with Magnetic Sensor or ENC",
    price: 899,
    originalPrice: 2999,
    discount: 70,
    image: "/images/categories/neckbands.png",
    slug: "uag-airdopes-band-enc-heavy-bass",
  },
  {
    id: "nb-4",
    name: "UAG StealthRun IPX5 Sweatproof Neckband",
    category: "Neckband with Magnetic Sensor or ENC",
    price: 799,
    originalPrice: 2499,
    discount: 68,
    image: "/images/categories/neckbands.png",
    slug: "uag-stealthrun-sweatproof-neckband",
  },

  // --- SMARTWATCHES ---
  {
    id: "sw-1",
    name: "UAG Rugged Calling Smartwatch Fit",
    category: "Smart Watch with Calling",
    price: 2499,
    originalPrice: 6999,
    discount: 65,
    image: "/images/categories/watches.png",
    slug: "uag-rugged-calling-smartwatch",
  },
  {
    id: "sw-2",
    name: "UAG Elite GPS Sports Smartwatch Pro",
    category: "Smart Watch with Calling",
    price: 3499,
    originalPrice: 8299,
    discount: 58,
    image: "/images/categories/watches.png",
    slug: "uag-elite-gps-sports-smartwatch",
  },
  {
    id: "sw-3",
    name: "UAG ActiveSync Slim Smartwatch Active",
    category: "Smart Watch with Calling",
    price: 1999,
    originalPrice: 4999,
    discount: 60,
    image: "/images/categories/watches.png",
    slug: "uag-activesync-slim-smartwatch",
  },

  // --- POWER BANKS ---
  {
    id: "pb-1",
    name: "UAG SolarCharge Rugged Power Bank",
    category: "Power Bank Fast Charge Tech",
    price: 1999,
    originalPrice: 3999,
    discount: 50,
    image: "/images/categories/powerbanks.png",
    slug: "uag-solarcharge-rugged-powerbank",
  },
  {
    id: "pb-2",
    name: "UAG PowerCore Fast Charge Solar Battery",
    category: "Power Bank Fast Charge Tech",
    price: 1499,
    originalPrice: 3799,
    discount: 60,
    image: "/images/categories/powerbanks.png",
    slug: "uag-powercore-fast-charge-solar",
  },

  // --- BLUETOOTH SPEAKERS ---
  {
    id: "sp-1",
    name: "UAG OmniSound Portable Bluetooth Speaker",
    category: "Portable & Party Speaker with Clear Bass",
    price: 1899,
    originalPrice: 4999,
    discount: 62,
    image: "/images/categories/speakers.png",
    slug: "uag-omnisound-portable-speaker",
  },
  {
    id: "sp-2",
    name: "UAG BassBox Party Speaker LED Glow",
    category: "Portable & Party Speaker with Clear Bass",
    price: 2999,
    originalPrice: 6699,
    discount: 55,
    image: "/images/categories/speakers.png",
    slug: "uag-bassbox-party-speaker-led",
  },

  // --- DATA CABLES ---
  {
    id: "cb-1",
    name: "UAG FastCharge 240W Braided USB-C Cable",
    category: "Data Cable Fast Charge Tech",
    price: 499,
    originalPrice: 1499,
    discount: 67,
    image: "/images/categories/cables.png",
    slug: "uag-fastcharge-240w-braided-cable",
  },
  {
    id: "cb-2",
    name: "UAG ToughLink USB-C to Lightning Cable",
    category: "Data Cable Fast Charge Tech",
    price: 399,
    originalPrice: 999,
    discount: 60,
    image: "/images/categories/cables.png",
    slug: "uag-toughlink-lightning-cable",
  },

  // --- DRONES ---
  {
    id: "dr-1",
    name: "UAG AeroStrike HD Quadcopter Camera Drone",
    category: "Commercial Survey Drone Tech",
    price: 5499,
    originalPrice: 9999,
    discount: 45,
    image: "/images/products/drone.png",
    slug: "uag-aerostrike-hd-camera-drone",
  },
  {
    id: "dr-2",
    name: "UAG SkySpy Micro Survey Camera Drone Pro",
    category: "Commercial Survey Drone Tech",
    price: 3999,
    originalPrice: 7999,
    discount: 50,
    image: "/images/products/drone.png",
    slug: "uag-skyspy-micro-survey-drone",
  },
];

export default function NewArrivals() {
  const [activeTab, setActiveTab] = useState("earbuds");

  // Filter products by active tab category
  const filteredProducts = useMemo(() => {
    // If a tab has fewer than 10 products, we can pad it using items from other categories
    // so that the UI grid is always populated with exactly 10 cards as requested.
    const activeCategoryProducts = mockProducts.filter((p) => p.id.startsWith(activeTab.substring(0, 2)));
    
    if (activeCategoryProducts.length >= 10) {
      return activeCategoryProducts.slice(0, 10);
    }

    // Pad with other items if category doesn't have 10
    const otherProducts = mockProducts.filter((p) => !p.id.startsWith(activeTab.substring(0, 2)));
    return [...activeCategoryProducts, ...otherProducts].slice(0, 10);
  }, [activeTab]);

  return (
    <section className="w-full bg-white py-12 dark:bg-zinc-950 font-sans border-t border-zinc-150 dark:border-zinc-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Headers */}
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-3xl font-black font-heading text-zinc-900 dark:text-white">
            New Arrivals
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 font-medium">
            How can you evaluate content without design
          </p>
        </div>

        {/* Categories Tab Filters (Horizontal scroll on mobile, flex row on desktop) */}
        <div className="flex justify-start md:justify-center items-center overflow-x-auto pb-4 mb-8 border-b border-zinc-100 dark:border-zinc-800/40 scrollbar-none gap-6 sm:gap-8 font-sans">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-bold uppercase tracking-wider pb-2.5 transition-all outline-hidden shrink-0 border-b-2 ${
                activeTab === tab.id
                  ? "border-zinc-900 text-zinc-900 font-extrabold dark:border-white dark:text-white"
                  : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-650"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid (10 Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom Explore Button */}
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            className="font-bold tracking-widest text-xs uppercase px-8 h-12 border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/60 dark:hover:text-white text-zinc-800 dark:text-zinc-200 rounded-xl transition-all active:scale-95"
            asChild
          >
            <Link href="/new-launches">
              Explore Products
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
