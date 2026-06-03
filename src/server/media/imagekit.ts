import "server-only";

import { z } from "zod";
import { createHmac } from "crypto";

const imagekitEnvSchema = z.object({
  publicKey: z.string().min(10),
  privateKey: z.string().min(10),
  urlEndpoint: z.string().url(),
});

function getImagekitEnvFromLegacy(): z.infer<typeof imagekitEnvSchema> | null {
  const legacyPublic = process.env.IMAGE_KIT_PUBLIC_KEY;
  const legacyPrivate = process.env.IMAGE_KIT_PRIVATE_KEY;
  const legacyUrl = process.env.IMAGE_KIT_URL;

  if (legacyPublic && legacyPrivate && legacyUrl) {
    const parsed = imagekitEnvSchema.safeParse({
      publicKey: legacyPublic,
      privateKey: legacyPrivate,
      urlEndpoint: legacyUrl,
    });
    return parsed.success ? parsed.data : null;
  }

  return null;
}

export function getImagekitEnv(): z.infer<typeof imagekitEnvSchema> | null {
  const newPublic = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const newPrivate = process.env.IMAGEKIT_PRIVATE_KEY;
  const newUrl = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (newPublic && newPrivate && newUrl) {
    const parsed = imagekitEnvSchema.safeParse({
      publicKey: newPublic,
      privateKey: newPrivate,
      urlEndpoint: newUrl,
    });
    if (parsed.success) return parsed.data;
  }

  return getImagekitEnvFromLegacy();
}

export interface ImagekitUploadAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

export function generateImagekitSignature(
  token: string,
  expire: number
): string {
  const env = getImagekitEnv();

  if (!env) {
    throw new Error("ImageKit environment not configured");
  }

  const signatureString = `${token}${expire}`;
  const signature = createHmac("sha1", env.privateKey)
    .update(signatureString)
    .digest("hex");

  return signature;
}

export function getImagekitUploadAuth(): ImagekitUploadAuth {
  const env = getImagekitEnv();

  if (!env) {
    throw new Error("ImageKit environment not configured");
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 300;

  const signature = generateImagekitSignature(token, expire);

  return {
    token,
    expire,
    signature,
    publicKey: env.publicKey,
    urlEndpoint: env.urlEndpoint,
  };
}

export function isImagekitAssetUrl(assetUrl: string): boolean {
  const env = getImagekitEnv();

  if (!env) {
    return false;
  }

  try {
    const endpoint = new URL(env.urlEndpoint);
    const asset = new URL(assetUrl);
    const endpointPath = endpoint.pathname.replace(/\/+$/, "");

    if (
      asset.protocol !== endpoint.protocol ||
      asset.hostname !== endpoint.hostname
    ) {
      return false;
    }

    if (!endpointPath || endpointPath === "/") {
      return true;
    }

    return (
      asset.pathname === endpointPath ||
      asset.pathname.startsWith(`${endpointPath}/`)
    );
  } catch {
    return false;
  }
}

export function isSafeImagekitStorageKey(storageKey: string): boolean {
  const value = storageKey.trim();

  return (
    value.length > 0 &&
    !value.includes("..") &&
    !value.includes("\\") &&
    !value.startsWith("//") &&
    !/^https?:\/\//i.test(value)
  );
}
