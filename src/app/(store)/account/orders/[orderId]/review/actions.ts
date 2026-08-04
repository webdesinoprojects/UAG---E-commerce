"use server";

import "server-only";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCustomer } from "@/server/auth/customer";
import { createProductReview, readCustomerOrderById } from "@/server/repositories/commerce-repository";
import { enforceRateLimit } from "@/server/security/rate-limit";

const schema = z.object({
  orderId: z.string().uuid(), productId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().min(10).max(2000),
});

export async function submitProductReviewAction(formData: FormData) {
  await enforceRateLimit("review:submit", 5, 60 * 15);
  const customer = await requireCustomer();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid review.");
  const order = await readCustomerOrderById(parsed.data.orderId, customer.id);
  if (!order || order.status !== "delivered") throw new Error("Only delivered products can be reviewed.");
  if (!order.items.some((item) => item.productId === parsed.data.productId)) throw new Error("Product is not part of this order.");
  await createProductReview({ customerId: customer.id, ...parsed.data });
  redirect(`/account/orders/${order.id}?review=submitted`);
}
