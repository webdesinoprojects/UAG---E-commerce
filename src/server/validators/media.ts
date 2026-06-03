import "server-only";

import { z } from "zod";
import { ALLOWED_MIME_TYPES, FILE_SIZE_LIMITS } from "@/features/media/types";

export const createMediaAssetSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  storageKey: z.string().min(1, "Storage key is required"),
  url: z.string().url("Invalid URL"),
  thumbnailUrl: z.string().url().optional(),
  name: z.string().min(1, "Name is required"),
  altText: z.string().max(500, "Alt text too long").optional(),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sizeBytes: z.number().int().positive().max(FILE_SIZE_LIMITS.video, "File too large"),
  folder: z.string()
    .max(100, "Folder name too long")
    .regex(/^[a-z0-9][a-z0-9/_-]*$/, "Invalid folder format")
    .optional(),
});

export type CreateMediaAssetInput = z.infer<typeof createMediaAssetSchema>;

export type MediaAssetDto = import("@/features/media/types").MediaAssetDto;

export function mapDbRowToMediaAssetDto(row: {
  id: string;
  provider: "imagekit" | "local" | "external";
  storage_key: string;
  url: string;
  alt_text: string | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  folder: string | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}): MediaAssetDto {
  return {
    id: row.id,
    provider: row.provider,
    storageKey: row.storage_key,
    url: row.url,
    altText: row.alt_text,
    mimeType: row.mime_type,
    width: row.width,
    height: row.height,
    sizeBytes: row.size_bytes,
    folder: row.folder,
    isPublic: row.is_public,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}