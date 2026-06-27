"use server";

import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CART_COOKIE_NAME, getCartCookieOptions } from "@/lib/cart-cookies";
import { encodeCartCookie, readCartCookieItems } from "./queries";
import { adjustProductStock } from "@/server/repositories/catalog-repository";

const productIdSchema = z.string().uuid();
const quantitySchema = z.coerce.number().int().min(1).max(99);

async function writeCart(items: { productId: string; quantity: number }[]) {
  const cookieStore = await cookies();

  if (items.length === 0) {
    cookieStore.delete(CART_COOKIE_NAME);
    return;
  }

  cookieStore.set(
    CART_COOKIE_NAME,
    encodeCartCookie(items.slice(0, 50)),
    getCartCookieOptions()
  );
}

export async function addToCartAction(formData: FormData) {
  const productId = productIdSchema.parse(formData.get("productId"));
  const quantity = quantitySchema.parse(formData.get("quantity") ?? 1);
  const redirectTo = formData.get("redirectTo")?.toString();
  const items = await readCartCookieItems();
  const existing = items.find((item) => item.productId === productId);
  const oldQty = existing?.quantity ?? 0;
  const newQty = Math.min(oldQty + quantity, 99);

  if (existing) {
    existing.quantity = newQty;
  } else {
    items.push({ productId, quantity: newQty });
  }

  if (newQty !== oldQty) {
    await adjustProductStock(productId, newQty - oldQty);
  }

  await writeCart(items);
  revalidatePath("/cart");
  revalidatePath("/");
  revalidatePath("/admin/inventory");

  if (redirectTo) {
    redirect(redirectTo);
  }
}

export async function updateCartQuantityAction(formData: FormData) {
  const productId = productIdSchema.parse(formData.get("productId"));
  const newQuantity = quantitySchema.parse(formData.get("quantity"));
  const items = await readCartCookieItems();
  const existing = items.find((item) => item.productId === productId);
  const oldQty = existing?.quantity ?? 0;

  if (newQuantity === oldQty) return;
  if (newQuantity < 1) throw new Error("Quantity must be at least 1.");

  await adjustProductStock(productId, newQuantity - oldQty);

  const updated = items.map((item) =>
    item.productId === productId ? { ...item, quantity: newQuantity } : item
  );

  await writeCart(updated);
  revalidatePath("/cart");
  revalidatePath("/");
  revalidatePath("/admin/inventory");
}

export async function removeCartItemAction(formData: FormData) {
  const productId = productIdSchema.parse(formData.get("productId"));
  const items = await readCartCookieItems();
  const existing = items.find((item) => item.productId === productId);
  const oldQty = existing?.quantity ?? 0;

  if (oldQty > 0) {
    await adjustProductStock(productId, -oldQty);
  }

  const filtered = items.filter((item) => item.productId !== productId);
  await writeCart(filtered);
  revalidatePath("/cart");
  revalidatePath("/");
  revalidatePath("/admin/inventory");
}

export async function clearCartAction() {
  const items = await readCartCookieItems();

  for (const item of items) {
    await adjustProductStock(item.productId, -item.quantity);
  }

  await writeCart([]);
  revalidatePath("/cart");
  revalidatePath("/");
  revalidatePath("/admin/inventory");
}
