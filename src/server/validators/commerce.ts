import "server-only";

import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(180).optional().or(z.literal("")).or(z.null()),
  line1: z.string().trim().min(5).max(160),
  line2: z.string().trim().max(160).optional().default(""),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(12),
  paymentMethod: z.enum(["cod", "razorpay"]),
  notes: z.string().trim().max(500).optional().default(""),
  couponCode: z.string().trim().max(50).optional().or(z.literal("")),
  saveAddress: z.coerce.boolean().optional().default(false),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const customerAddressSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  line1: z.string().trim().min(5).max(160),
  line2: z.string().trim().max(160).optional().default(""),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(12),
  country: z.string().trim().length(2).default("IN"),
  isDefault: z.coerce.boolean().optional().default(false),
});

export type CustomerAddressInput = z.infer<typeof customerAddressSchema>;

export const customerOrderCancelSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().trim().max(240).optional().default(""),
});

export const orderServiceRequestSchema = z.object({
  orderId: z.string().uuid(),
  orderItemId: z.string().uuid().optional().or(z.literal("")),
  requestType: z.enum(["return", "replacement"]),
  quantity: z.coerce.number().int().min(1).max(99),
  reason: z.string().trim().min(3).max(120),
  details: z.string().trim().min(10).max(1000),
});

export type OrderServiceRequestInput = z.infer<typeof orderServiceRequestSchema>;

export const adminOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["booked", "processing", "shipped", "delivered", "cancelled"]),
  trackingNumber: z.string().trim().max(80).optional().default(""),
  note: z.string().trim().max(500).optional().default(""),
});

export const adminServiceRequestStatusSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum([
    "requested",
    "approved",
    "pickup_scheduled",
    "received",
    "replacement_shipped",
    "refunded",
    "rejected",
    "cancelled",
    "completed",
  ]),
  adminNote: z.string().trim().max(500).optional().default(""),
});

export type AdminServiceRequestStatusInput = z.infer<
  typeof adminServiceRequestStatusSchema
>;

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
