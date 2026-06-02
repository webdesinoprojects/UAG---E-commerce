"use client";

import React, { useState } from "react";
import { ProductDetail } from "../types";
import { ChevronLeft, ChevronRight, LayoutGrid, Repeat, Share2 } from "lucide-react";

interface ProductInfoProps {
  product: ProductDetail;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* Title */}
      <div className="flex items-start justify-between gap-6 mb-6">
        <h1 className="text-3xl font-medium text-zinc-800 dark:text-zinc-100 leading-tight">
          {product.name}
        </h1>
      </div>

      {/* Description */}
      <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
        {product.description}
      </p>

      {/* Pricing */}
      <div className="flex items-center gap-2 mb-6">
        {product.originalPrice > product.price && (
          <span className="text-2xl font-medium text-zinc-400 line-through decoration-1">
            ₹{product.originalPrice.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </span>
        )}
        <span className="text-2xl font-bold text-blue-600">
          ₹{product.price.toLocaleString('en-IN', {minimumFractionDigits: 2})}
        </span>
      </div>

      {/* Quantity & Buy Now Actions */}
      <div className="flex gap-4 mb-8">
        {/* Quantity Selector */}
        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded h-11">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            -
          </button>
          <div className="w-10 h-full flex items-center justify-center text-sm border-x border-zinc-200 dark:border-zinc-800">
            {quantity}
          </div>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            +
          </button>
        </div>
        
        {/* Buy Now */}
        <button className="flex-1 bg-[#222222] text-white font-bold text-[11px] tracking-[0.1em] uppercase rounded h-11 hover:bg-black transition-colors">
          BUY NOW
        </button>
      </div>

      {/* Pincode Checker */}
      <div className="flex flex-col mb-8">
        <input 
          type="text" 
          placeholder="Enter Pincode" 
          className="w-full px-4 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded mb-2 focus:outline-none focus:border-zinc-400 bg-transparent placeholder:text-zinc-500"
        />
        <button className="self-start px-6 py-2.5 bg-[#f5f5f5] dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-[11px] uppercase tracking-wide rounded">
          CHECK PINCODE
        </button>
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800 mb-4" />

      {/* Compare & Share */}
      <div className="flex items-center justify-between py-1 mb-4">
        <button className="flex items-center gap-2 text-[13px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
          <Repeat className="w-4 h-4" strokeWidth={2} /> Add to compare
        </button>
        <button className="flex items-center gap-2 text-[13px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
          Share:
        </button>
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800 mb-6" />

      {/* Trust Badges */}
      <div className="flex flex-col gap-4">
        <div className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">
          Guaranteed Safe Checkout
        </div>
        <div className="flex flex-wrap gap-2 items-center opacity-80">
          <div className="h-8 px-2 bg-white border border-zinc-200 rounded flex items-center justify-center text-[10px] font-black italic tracking-tighter">COD</div>
          <div className="h-8 px-2 bg-white border border-zinc-200 rounded flex items-center justify-center text-[10px] font-bold text-blue-800 italic">PayPal</div>
          <div className="h-8 px-2 bg-white border border-zinc-200 rounded flex items-center justify-center">
            <div className="flex items-center -space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500 mix-blend-multiply"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 mix-blend-multiply"></div>
            </div>
          </div>
          <div className="h-8 px-2 bg-white border border-zinc-200 rounded flex items-center justify-center text-[10px] font-black text-blue-700 italic">VISA</div>
          <div className="h-8 px-2 bg-white border border-zinc-200 rounded flex items-center justify-center text-[10px] font-bold">Pay</div>
          <div className="h-8 px-2 bg-white border border-zinc-200 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">G Pay</div>
        </div>
      </div>

    </div>
  );
}
