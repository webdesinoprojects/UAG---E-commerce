import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_VERSION = "v1";

function signingKey() {
  const key = process.env.GUEST_ORDER_TOKEN_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Guest order token signing is not configured.");
  return key;
}

function signature(payload: string) {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

export function createGuestOrderAccessToken(orderId: string, maxAgeSeconds: number) {
  const expiresAt = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const payload = `${TOKEN_VERSION}.${orderId}.${expiresAt}`;
  return `${payload}.${signature(payload)}`;
}

export function verifyGuestOrderAccessToken(token: string | undefined, orderId: string) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [version, tokenOrderId, expiresAtRaw, suppliedSignature] = parts;
  if (version !== TOKEN_VERSION || tokenOrderId !== orderId) return false;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;
  const payload = `${version}.${tokenOrderId}.${expiresAtRaw}`;
  const expected = Buffer.from(signature(payload));
  const supplied = Buffer.from(suppliedSignature);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
