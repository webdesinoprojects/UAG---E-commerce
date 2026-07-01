import type { Coupon } from "./types";

const API_BASE = "/api/commerce/coupons";

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getActiveCoupons(): Promise<Coupon[]> {
  const data = await fetchJSON(API_BASE);
  return data.coupons ?? [];
}

export async function getAdminCoupons(): Promise<Coupon[]> {
  const data = await fetchJSON(`${API_BASE}?admin=1`);
  return data.coupons ?? [];
}

export async function createCoupon(payload: {
  code: string;
  description?: string | null;
  percentOff: number;
  minCents?: number;
  maxDiscountCents?: number | null;
  isActive?: boolean;
  startsAt?: string;
  expiresAt?: string | null;
}): Promise<Coupon> {
  const data = await fetchJSON(API_BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.coupon;
}

export async function updateCoupon(id: string, patch: Record<string, unknown>): Promise<Coupon> {
  const data = await fetchJSON(`${API_BASE}?admin=1`, {
    method: "PATCH",
    body: JSON.stringify({ id, ...patch }),
  });
  return data.coupon;
}

export async function deleteCouponApi(id: string): Promise<void> {
  await fetchJSON(`${API_BASE}?admin=1`, {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

export function calculateDiscount(coupon: Coupon | null, subtotalCents: number) {
  if (!coupon) return { discountCents: 0, totalCents: subtotalCents };
  if (subtotalCents < coupon.minCents)
    return { discountCents: 0, totalCents: subtotalCents, error: `Minimum ${coupon.minCents / 100} required` };

  const raw = Math.round((coupon.percentOff / 100) * subtotalCents);
  const capped =
    coupon.maxDiscountCents !== null && coupon.maxDiscountCents !== undefined
      ? Math.min(raw, coupon.maxDiscountCents)
      : raw;

  return {
    discountCents: capped,
    totalCents: Math.max(subtotalCents - capped, 0),
  };
}
