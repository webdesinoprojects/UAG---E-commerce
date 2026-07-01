import "server-only";

import crypto from "node:crypto";
import { z } from "zod";

const razorpayEnvSchema = z.object({
  RAZORPAY_KEY_ID: z.string().min(6),
  RAZORPAY_KEY_SECRET: z.string().min(12),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(12).optional(),
});

export function getRazorpayEnv() {
  const parsed = razorpayEnvSchema.safeParse(process.env);
  return parsed.success ? parsed.data : null;
}

export function getRazorpayPublicKey() {
  return getRazorpayEnv()?.RAZORPAY_KEY_ID ?? null;
}

export async function createRazorpayOrder(input: {
  amountCents: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const env = getRazorpayEnv();

  if (!env) {
    throw new Error("Razorpay is not configured.");
  }

  const credentials = Buffer.from(
    `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`,
    "utf8"
  ).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountCents,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes ?? {},
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to create Razorpay order.");
  }

  const data = (await response.json()) as { id?: string };

  if (!data.id) {
    throw new Error("Razorpay did not return an order id.");
  }

  return { id: data.id };
}

export function verifyRazorpayPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}) {
  const env = getRazorpayEnv();
  if (!env) return false;

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(input.signature);

  return (
    expectedBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

export function verifyRazorpayWebhookSignature(input: {
  body: string;
  signature: string | null;
}) {
  const env = getRazorpayEnv();
  if (!env?.RAZORPAY_WEBHOOK_SECRET || !input.signature) return false;

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(input.body)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(input.signature);

  return (
    expectedBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  );
}
