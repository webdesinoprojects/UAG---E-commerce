"use server";

import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CART_COOKIE_NAME, getCartCookieOptions } from "@/lib/cart-cookies";
import { encodeCartCookie, readCartCookieItems } from "./queries";
import { readPublicProductPurchaseDestination } from "@/server/repositories/catalog-repository";

const productIdSchema = z.string().uuid();
const quantitySchema = z.coerce.number().int().min(1);

async function writeCart(items: { productId: string; quantity: number }[]) {
  const cookieStore = await cookies();

  if (items.length === 0) {
    cookieStore.delete(CART_COOKIE_NAME);
    return;
  }

  cookieStore.set(
    CART_COOKIE_NAME,
    encodeCartCookie(items),
    getCartCookieOptions()
  );
}

async function addProductToCart(productId: string, quantity: number) {
  const items = await readCartCookieItems();
  const existing = items.find((item) => item.productId === productId);
  const newQuantity = (existing?.quantity ?? 0) + quantity;

  if (existing) {
    existing.quantity = newQuantity;
  } else {
    items.push({ productId, quantity: newQuantity });
  }

  await writeCart(items);
  revalidatePath("/cart");
  revalidatePath("/");
}

export async function addToCartAction(formData: FormData) {
  const productId = productIdSchema.parse(formData.get("productId"));
  const quantity = quantitySchema.parse(formData.get("quantity") ?? 1);
  const redirectTo = formData.get("redirectTo")?.toString();
  await addProductToCart(productId, quantity);

  if (redirectTo) {
    redirect(redirectTo);
  }
}

export async function buyNowAction(formData: FormData) {
  const productId = productIdSchema.parse(formData.get("productId"));
  const quantity = quantitySchema.parse(formData.get("quantity") ?? 1);
  const destination = await readPublicProductPurchaseDestination(productId);

  if (!destination) {
    redirect("/cart");
  }

  await addProductToCart(productId, quantity);

  const fallbackPath = `/products/${destination.slug}`;
  const configuredUrl = destination.productUrl;
  if (!configuredUrl) redirect(fallbackPath);

  if (/^\/(?!\/)/.test(configuredUrl)) {
    redirect(configuredUrl);
  }

  let externalDestination = fallbackPath;
  try {
    const parsedUrl = new URL(configuredUrl);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      externalDestination = parsedUrl.toString();
    }
  } catch {}

  redirect(externalDestination);
}

export async function updateCartQuantityAction(formData: FormData) {
  const productId = productIdSchema.parse(formData.get("productId"));
  const newQuantity = quantitySchema.parse(formData.get("quantity"));
  const items = await readCartCookieItems();
  const existing = items.find((item) => item.productId === productId);
  const oldQty = existing?.quantity ?? 0;

  if (newQuantity === oldQty) return;
  if (newQuantity < 1) throw new Error("Quantity must be at least 1.");

  const updated = items.map((item) =>
    item.productId === productId ? { ...item, quantity: newQuantity } : item
  );

  await writeCart(updated);
  revalidatePath("/cart");
  revalidatePath("/");
}

export async function removeCartItemAction(formData: FormData) {
  const productId = productIdSchema.parse(formData.get("productId"));
  const items = await readCartCookieItems();
  const filtered = items.filter((item) => item.productId !== productId);
  await writeCart(filtered);
  revalidatePath("/cart");
  revalidatePath("/");
}

export async function clearCartAction() {
  await writeCart([]);
  revalidatePath("/cart");
  revalidatePath("/");
}
