"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Cpu, Zap, Activity, Star, Check, ShoppingCart, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const bentoItems = [
  // 1. Tall Drone Card (1x2, spans 2 rows, 1 col)
  {
    id: "bento-drone",
    title: "AeroStrike HD",
    subtitle: "Commercial Quadcopter",
    description: "Equipped with dual GPS tracking, 4K camera gimbal, and 40-minute flight cells.",
    image: "/images/products/drone.png",
    slug: "uag-aerostrike-hd-camera-drone",
    gridClass: "col-span-1 row-span-2 md:col-span-1 md:row-span-2",
    badge: "Air-Tech",
    icon: Activity,
    price: "₹48,999.00",
    originalPrice: "₹79,999.00",
    rating: "4.9",
    reviewsCount: "142",
    features: [
      "Dual GPS/GLONASS positioning stability",
      "4K HDR video + 3-axis mechanical gimbal stabilization",
      "Up to 40 minutes flight time on a single battery",
      "5km transmission range with low-latency HD live feed",
      "Smart return-to-home and obstacle avoidance system"
    ]
  },
  // 2. Wide Cyber Audio Banner Card (2x1, spans 1 row, 2 cols)
  {
    id: "bento-banner1",
    title: "CYBER AUDIO LABS",
    subtitle: "Tactical Pro Gaming Essentials",
    description: "Engineered for immersive low-latency gameplay and crystal clear team communication.",
    image: "/images/carousel/banner1.png",
    slug: "uag-crystal-gaming-anc",
    gridClass: "col-span-2 row-span-1 md:col-span-2 md:row-span-1",
    badge: "Studio Pro",
    icon: ShieldCheck,
    price: "₹4,499.00",
    originalPrice: "₹9,999.00",
    rating: "4.8",
    reviewsCount: "298",
    features: [
      "Ultra-low 35ms latency wireless connection",
      "Hybrid Active Noise Cancellation (up to -40dB)",
      "Detachable broadcast-grade condenser microphone",
      "Ergonomic cooling-gel infused memory foam ear cushions",
      "Up to 60 hours battery life with fast charging"
    ]
  },
  // 3. Watches Card (1x1)
  {
    id: "bento-watch",
    title: "Vital Smartwatch",
    subtitle: "Rugged Health Trackers",
    image: "/images/categories/watches.png",
    slug: "uag-elite-gps-sports-smartwatch",
    gridClass: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
    badge: "GPS Call",
    icon: Cpu,
    price: "₹3,999.00",
    originalPrice: "₹12,999.00",
    rating: "4.7",
    reviewsCount: "1,044",
    features: [
      "Built-in multi-system GPS & route backtracking",
      "24/7 Heart rate, SpO2, and advanced sleep monitoring",
      "Bluetooth calling with AI noise reduction mic/speaker",
      "Military-grade carbon fiber casing (IP68 certified)",
      "14-day battery life under heavy smart use"
    ]
  },
  // 4. Power Bank Card (1x1)
  {
    id: "bento-powerbank",
    title: "Solar Power Core",
    subtitle: "50K mAh Backup Battery",
    image: "/images/categories/powerbanks.png",
    slug: "uag-solarcharge-rugged-powerbank",
    gridClass: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
    badge: "Solar Fast",
    icon: Zap,
    price: "₹2,999.00",
    originalPrice: "₹8,999.00",
    rating: "4.6",
    reviewsCount: "712",
    features: [
      "Monocrystalline silicon solar panel for trickle charging",
      "High capacity 50,000mAh lithium-polymer cells",
      "Dual 22.5W USB-A & 45W USB-C Power Delivery outputs",
      "Super-bright triple-mode LED emergency flashlight",
      "Rugged shockproof and dust-resistant casing"
    ]
  },
  // 5. Wide Omni Soundstage Card (2x1, spans 1 row, 2 cols)
  {
    id: "bento-banner2",
    title: "OMNI SOUNDSTAGE",
    subtitle: "Ambient Audio Projection",
    description: "Heavy subwoofers with sync LED lights, optimized for wide outdoor acoustics.",
    image: "/images/carousel/banner2.png",
    slug: "uag-omnisound-portable-speaker",
    gridClass: "col-span-2 row-span-1 md:col-span-2 md:row-span-1",
    badge: "IPX7 Sound",
    icon: Activity,
    price: "₹7,999.00",
    originalPrice: "₹19,999.00",
    rating: "4.8",
    reviewsCount: "451",
    features: [
      "80W RMS powerful output with dual passive radiators",
      "360-degree ambient audio projection with deep bass",
      "Dynamic RGB light show syncing to the audio rhythm",
      "IPX7 waterproof rating - perfect for pool & outdoors",
      "TWS pair capability for true wireless stereo sound"
    ]
  },
  // 6. Earbuds Card (1x1)
  {
    id: "bento-earbuds",
    title: "Pro ANC Earbuds",
    subtitle: "True Noise Shield Buds",
    image: "/images/categories/earbuds.png",
    slug: "uag-crystal-gaming-anc",
    gridClass: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
    badge: "ANC Mode",
    icon: ShieldCheck,
    price: "₹1,999.00",
    originalPrice: "₹7,999.00",
    rating: "4.7",
    reviewsCount: "1,822",
    features: [
      "Hybrid ANC with Smart Ambient transparency mode",
      "13mm graphene-coated drivers for crisp treble & bass",
      "Dual mics per earbud with clear voice capture (CVC 8.0)",
      "Sweatproof nano-coating (IPX5 dust/water resistance)",
      "Up to 45 hours total play time with the wireless case"
    ]
  },
  // 7. Neckband Card (1x1)
  {
    id: "bento-neckband",
    title: "Sport Neckbands",
    subtitle: "Magnetic Sensor Buds",
    image: "/images/categories/neckbands.png",
    slug: "uag-magnetic-sensor-neckband-pro",
    gridClass: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
    badge: "12hr Play",
    icon: Activity,
    price: "₹999.00",
    originalPrice: "₹2,999.00",
    rating: "4.5",
    reviewsCount: "945",
    features: [
      "Magnetic instant-connect smart switch sensors",
      "Ergonomic lightweight neckband with memory alloy wire",
      "10mm dynamic bass boost driver acoustics",
      "Bluetooth 5.3 with dual pairing capability",
      "Fast charging: 10 mins charge gives 120 mins playback"
    ]
  },
  // 8. Cables Card (1x1)
  {
    id: "bento-cable",
    title: "Armour Speed",
    subtitle: "240W Heavy Duty USB-C",
    image: "/images/categories/cables.png",
    slug: "uag-fastcharge-240w-braided-cable",
    gridClass: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
    badge: "240W Type-C",
    icon: Zap,
    price: "₹499.00",
    originalPrice: "₹1,499.00",
    rating: "4.9",
    reviewsCount: "3,410",
    features: [
      "Extreme 240W (48V/5A) Power Delivery support",
      "Kevlar-reinforced double braided nylon sleeve jacket",
      "Built-in E-Marker smart chip for power regulation",
      "Reinforced alloy connector joints with 30,000+ bend life",
      "Supports USB 2.0 480Mbps high-speed data transfers"
    ]
  },
  // 9. Speakers Card (1x1)
  {
    id: "bento-speaker",
    title: "Omni Speakers",
    subtitle: "Clear Bass Acoustics",
    image: "/images/categories/speakers.png",
    slug: "uag-omnisound-portable-speaker",
    gridClass: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
    badge: "True Bass",
    icon: ShieldCheck,
    price: "₹2,499.00",
    originalPrice: "₹5,999.00",
    rating: "4.6",
    reviewsCount: "389",
    features: [
      "Dual 10W stereo speakers for high clarity acoustics",
      "Patented bass-reflex system for deep distortion-free low-end",
      "Compact travel design with fabric mesh grill finish",
      "Supports MicroSD, AUX input, and Bluetooth connectivity",
      "12-hour continuous battery playtime per full charge"
    ]
  },
];

export default function BentoGrid() {
  const [selectedItem, setSelectedItem] = React.useState<typeof bentoItems[0] | null>(null);

  return (
    <section className="w-full bg-white py-12 dark:bg-zinc-950 font-sans border-t border-zinc-150 dark:border-zinc-800/80 mb-12 md:mb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col items-center text-center mb-10 select-none">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-primary">
            GALLERY SHOWCASE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-zinc-900 dark:text-white mt-1.5">
            Engineered Ecosystem
          </h2>
          <Separator className="w-12 h-1 bg-primary mt-3 rounded-full" />
        </div>

        {/* Bento Grid (2-columns on mobile, 3-columns on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-3 grid-flow-dense gap-3 sm:gap-4 lg:gap-6 auto-rows-[160px] sm:auto-rows-[220px] md:auto-rows-[280px]">
          {bentoItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Card
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-850/80 bg-zinc-950 text-white transition-all duration-500 ease-out group flex flex-col justify-between p-4 sm:p-6 hover:shadow-xl hover:border-zinc-700 cursor-pointer hover:scale-[1.01] active:scale-[0.995] ${item.gridClass}`}
              >
                {/* Full-bleed Background Image for ALL Cards */}
                <div className="absolute inset-0 z-0 select-none">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Heavy dark gradient overlays to guarantee white text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/30 z-10" />
                </div>

                {/* Card Content (z-index 20 overlay) */}
                <div className="relative z-20 flex flex-col justify-between h-full w-full pointer-events-none">
                  
                  {/* Top: Badge / Icon */}
                  <div className="flex items-center justify-between w-full">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-300 px-2 py-0.5 sm:px-2.5 sm:py-0.75 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">
                      <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                      <span>{item.badge}</span>
                    </div>
                    
                    {/* Hover Link Icon */}
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="pointer-events-auto flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/10 backdrop-blur-xs border border-white/10 text-white opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-transparent"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>
                  </div>

                  {/* Bottom: Text description labels */}
                  <div className="mt-auto">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider leading-none">
                      {item.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs font-bold font-heading mt-1 leading-none text-zinc-300">
                      {item.subtitle}
                    </p>
                    
                    {/* Expanded description inside wide/tall blocks - hidden on smallest mobile heights to avoid overlap */}
                    {item.description && (
                      <p className="text-[9px] sm:text-[10px] leading-relaxed text-zinc-400 font-body mt-2 max-w-sm hidden sm:line-clamp-2 md:line-clamp-none">
                        {item.description}
                      </p>
                    )}
                  </div>

                </div>
              </Card>
            );
          })}
        </div>

      </div>

      {/* Fullscreen Overlay Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl w-[92vw] overflow-y-auto max-h-[90vh] bg-zinc-950 border-zinc-900 text-white rounded-3xl p-6 sm:p-8 backdrop-blur-xl ring-1 ring-zinc-800">
          {selectedItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Left Column: Visual Product Showcase */}
              <div className="relative flex items-center justify-center bg-zinc-900/40 rounded-2xl p-4 overflow-hidden border border-zinc-900 min-h-[250px] sm:min-h-[300px]">
                {/* Radial Glow Effect */}
                <div className="absolute w-48 h-48 rounded-full bg-primary/10 blur-3xl z-0 pointer-events-none" />
                
                <div className="relative w-full aspect-square z-10 flex items-center justify-center">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    fill
                    className="object-contain p-2 transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                  />
                </div>
              </div>

              {/* Right Column: Detailed Product Specs */}
              <div className="flex flex-col justify-between">
                <div>
                  {/* Category Badge & Star Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {React.createElement(selectedItem.icon, { className: "h-3.5 w-3.5 text-primary" })}
                      <span>{selectedItem.badge}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-zinc-300">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span>{selectedItem.rating}</span>
                      <span className="text-zinc-500 font-normal">({selectedItem.reviewsCount} reviews)</span>
                    </div>
                  </div>

                  {/* Header Title */}
                  <DialogHeader className="p-0 border-none bg-transparent">
                    <DialogTitle className="text-2xl sm:text-3xl font-black font-heading text-white leading-none uppercase tracking-wide">
                      {selectedItem.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm font-semibold font-heading text-primary mt-1">
                      {selectedItem.subtitle}
                    </DialogDescription>
                  </DialogHeader>

                  {/* Extended Description */}
                  <p className="text-xs text-zinc-400 font-body leading-relaxed mt-4">
                    {selectedItem.description || "Experience top-tier quality and durability engineered with precision components to enhance your active lifestyle and daily workflow."}
                  </p>

                  {/* Specifications Checklist */}
                  <div className="mt-6 border-t border-zinc-900 pt-5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-3">
                      Key Specifications
                    </h4>
                    <ul className="space-y-2">
                      {selectedItem.features?.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary mt-0.5">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Pricing & Checkout buttons */}
                <div className="mt-8 border-t border-zinc-900 pt-5 flex flex-col gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black tracking-tight text-white">
                      {selectedItem.price}
                    </span>
                    <span className="text-sm text-zinc-500 line-through">
                      {selectedItem.originalPrice}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      SAVE {Math.round((1 - parseFloat(selectedItem.price.replace(/[^\d.]/g, '')) / parseFloat(selectedItem.originalPrice.replace(/[^\d.]/g, ''))) * 100)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/products/${selectedItem.slug}`}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold uppercase text-xs tracking-wider transition-all duration-200 active:scale-[0.98]"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Buy Now
                    </Link>
                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-bold uppercase text-xs tracking-wider transition-all duration-200 active:scale-[0.98]"
                    >
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
