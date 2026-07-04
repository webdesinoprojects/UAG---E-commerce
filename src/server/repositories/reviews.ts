/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { createSupabaseServiceRoleClient } from "@/server/db/supabase";

export async function createProductReview(input: {
  customerId: string;
  productId: string;
  orderId: string;
  rating: number;
  title?: string;
  comment: string;
}) {
  const client = createSupabaseServiceRoleClient();
  if (!client) throw new Error("Database not available.");

  const { error } = await (client as any).from("commerce_product_reviews").insert({
    customer_id: input.customerId,
    product_id: input.productId,
    order_id: input.orderId,
    rating: input.rating,
    title: input.title ?? null,
    comment: input.comment,
  });

  if (error) throw new Error(error.message);
}