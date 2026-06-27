import "server-only";

import { cookies } from "next/headers";
import { CART_COOKIE_NAME } from "@/lib/cart-cookies";
import { readPublicCartLineItems } from "@/server/repositories/catalog-repository";
import type { CartCookieItem, CartSummary } from "./types";

function parseCartCookie(value: string | undefined): CartCookieItem[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        productId:
          typeof item.productId === "string" ? item.productId : "",
        quantity:
          typeof item.quantity === "number"
            ? Math.max(1, Math.min(Math.trunc(item.quantity), 99))
            : 1,
      }))
      .filter((item) => item.productId);
  } catch {
    return [];
  }
}

export async function readCartCookieItems(): Promise<CartCookieItem[]> {
  const cookieStore = await cookies();
  return parseCartCookie(cookieStore.get(CART_COOKIE_NAME)?.value);
}

export async function getCartSummary(): Promise<CartSummary> {
  const cookieItems = await readCartCookieItems();
  const items = await readPublicCartLineItems(cookieItems);
  const subtotalCents = items.reduce(
    (total, item) => total + item.lineTotalCents,
    0
  );
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return {
    items,
    itemCount,
    subtotalCents,
    currency: items[0]?.currency ?? "INR",
  };
}

export function encodeCartCookie(items: CartCookieItem[]) {
  return Buffer.from(JSON.stringify(items), "utf8").toString("base64url");
}
