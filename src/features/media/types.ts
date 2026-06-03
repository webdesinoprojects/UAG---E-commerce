export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "video/mp4",
  "video/webm",
] as const;

export const FILE_SIZE_LIMITS = {
  image: 8 * 1024 * 1024,
  gif: 12 * 1024 * 1024,
  video: 25 * 1024 * 1024,
} as const;

export const IMAGEKIT_UPLOAD_API_ENDPOINT =
  "https://upload.imagekit.io/api/v1/files/upload";

export const IMAGEKIT_UPLOAD_MIME_CHECK = `'file.mime' IN [${ALLOWED_MIME_TYPES
  .map((type) => `'${type}'`)
  .join(", ")}]`;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export function getFileSizeLimit(mimeType: string | null): number {
  if (!mimeType) return FILE_SIZE_LIMITS.image;

  if (mimeType === "image/gif") return FILE_SIZE_LIMITS.gif;
  if (mimeType.startsWith("video/")) return FILE_SIZE_LIMITS.video;

  return FILE_SIZE_LIMITS.image;
}

export function isMimeTypeAllowed(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType);
}

export function isMimeTypeDisallowed(mimeType: string | null): boolean {
  return mimeType === "image/svg+xml";
}

export interface MediaAssetDto {
  id: string;
  provider: "imagekit" | "local" | "external";
  storageKey: string;
  url: string;
  altText: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  folder: string | null;
  isPublic: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}
