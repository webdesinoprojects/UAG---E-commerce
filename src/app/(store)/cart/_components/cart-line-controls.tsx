"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import {
  removeCartItemAction,
  updateCartQuantityAction,
} from "@/features/cart/actions";

interface CartLineControlsProps {
  productId: string;
  quantity: number;
}

export function CartLineControls({
  productId,
  quantity,
}: CartLineControlsProps) {

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 items-center overflow-hidden rounded-md border border-zinc-200">
        <form action={updateCartQuantityAction}>
          <input type="hidden" name="productId" value={productId} />
          <input
            type="hidden"
            name="quantity"
            value={Math.max(1, quantity - 1)}
          />
          <button
            type="submit"
            disabled={quantity <= 1}
            className="flex h-10 w-10 items-center justify-center text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
        </form>
        <span className="flex h-10 w-12 items-center justify-center border-x border-zinc-200 text-sm font-bold">
          {quantity}
        </span>
        <form action={updateCartQuantityAction}>
          <input type="hidden" name="productId" value={productId} />
          <input
            type="hidden"
            name="quantity"
            value={quantity + 1}
          />
          <button
            type="submit"
            className="flex h-10 w-10 items-center justify-center text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </form>
      </div>

      <form action={removeCartItemAction}>
        <input type="hidden" name="productId" value={productId} />
        <button
          type="submit"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
