"use client";

import React, { useState } from "react";

interface DetailedDescription {
  summary: string;
  specifications: { label: string; value: string }[];
  usp: { label: string; value: string }[];
}

interface ProductTabsProps {
  detailedDescription?: DetailedDescription;
  shippingPolicy?: string;
}

export function ProductTabs({ detailedDescription, shippingPolicy }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "shipping">("description");

  if (!detailedDescription && !shippingPolicy) return null;

  return (
    <section className="mt-16 lg:mt-24 max-w-4xl mx-auto px-4 sm:px-0">
      {/* Centered Tab Headers */}
      <div className="flex items-center justify-center gap-8 border-b border-zinc-200 dark:border-zinc-800 mb-8">
        {detailedDescription && (
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-4 text-[13px] font-bold transition-colors relative ${
              activeTab === "description"
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Description
            {activeTab === "description" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 dark:bg-zinc-100" />
            )}
          </button>
        )}
        {shippingPolicy && (
          <button
            onClick={() => setActiveTab("shipping")}
            className={`pb-4 text-[13px] font-bold transition-colors relative ${
              activeTab === "shipping"
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Shipping Policy
            {activeTab === "shipping" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 dark:bg-zinc-100" />
            )}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="text-[13px] text-zinc-600 dark:text-zinc-400">
        {activeTab === "description" && detailedDescription && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <p className="font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {detailedDescription.summary}
            </p>

            <div>
              <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-4">Specifications:</h4>
              <ul className="flex flex-col gap-3">
                {detailedDescription.specifications.map((spec, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-zinc-400 mt-1">•</span>
                    <span>
                      <strong className="text-zinc-800 dark:text-zinc-200">{spec.label}:</strong> {spec.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-4">USP:</h4>
              <ul className="flex flex-col gap-3">
                {detailedDescription.usp.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-zinc-400 mt-1">•</span>
                    <span>
                      <strong className="text-zinc-800 dark:text-zinc-200">{item.label}:</strong> {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "shipping" && shippingPolicy && (
          <div className="animate-in fade-in duration-300 leading-relaxed">
            {shippingPolicy}
          </div>
        )}
      </div>
    </section>
  );
}
