import "server-only";

import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(180).optional().or(z.literal("")),
  line1: z.string().trim().min(5).max(160),
  line2: z.string().trim().max(160).optional().default(""),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(12),
  paymentMethod: z.enum(["cod", "razorpay"]),
  notes: z.string().trim().max(500).optional().default(""),
  couponCode: z.string().trim().max(50).optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const razorpayVerifySchema = z.object({
  orderId: z.string().uuid(),
  razorpay_order_id: z.string().min(8).max(120),
  razorpay_payment_id: z.string().min(8).max(120),
  razorpay_signature: z.string().min(16).max(256),
});

export type RazorpayVerifyInput = z.infer<typeof razorpayVerifySchema>;

export const reviewCreateSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional().default(""),
  comment: z.string().trim().min(5).max(1000),
});
