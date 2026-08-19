"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard, { type Product } from "@/features/catalog/components/product-card";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "earbuds", label: "EARBUDS" }, { id: "neckband", label: "NECKBAND" },
  { id: "smartwatch", label: "SMARTWATCH" }, { id: "powerbank", label: "POWER BANK" },
  { id: "speaker", label: "BLUETOOTH SPEAKER" }, { id: "cable", label: "DATA CABLE" },
  { id: "drone", label: "DRONE" },
];

function normalized(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, ""); }

function productCategoryLabel(category: string) {
  const normalizedCategory = normalized(category);

  if (normalizedCategory.includes("earbuds")) return "Earbuds Or Airdopes ENC";
  if (normalizedCategory.includes("neckband")) return "Neckband with Magnetic Sensor or ENC";

  return category;
}

export default function NewArrivals({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState("earbuds");
  const filteredProducts = useMemo(
    () => products
      .filter((product) => normalized(product.category).includes(activeTab))
      .slice(0, 10)
      .map((product) => ({
        ...product,
        category: productCategoryLabel(product.category),
      })),
    [activeTab, products]
  );

  return (
    <section className="w-full bg-white pt-2 pb-12 dark:bg-zinc-950 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-8">
                  <div className="mt-3 flex justify-center px-4 py-3 leading-none">
          <Link href="/categories" className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-500">Hurry up to buy</Link>
        </div>
          <h2 className="text-3xl font-black font-heading text-zinc-900 dark:text-white">New Arrivals</h2>
        
          <p className="text-14px text-zinc-400 dark:text-zinc-500 mt-2 font-medium">How can you evaluate content without design</p>
        </div>
        <div className="flex justify-start md:justify-center items-center overflow-x-auto pb-4 mb-8 border-b border-zinc-100 dark:border-zinc-800/40 scrollbar-none gap-6 sm:gap-8 font-sans">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-sm font-bold uppercase tracking-wider pb-2.5 transition-all outline-hidden shrink-0 border-b-2 sm:text-base ${activeTab === tab.id ? "border-zinc-900 text-zinc-900 font-extrabold dark:border-white dark:text-white" : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-650"}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        <div className="flex justify-center mt-12">
          <Button variant="outline" className="font-bold tracking-widest text-xs uppercase px-8 h-12 border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/60 dark:hover:text-white text-zinc-800 dark:text-zinc-200 rounded-xl transition-all active:scale-95" asChild>
            <Link href="/new-launches">Explore Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
