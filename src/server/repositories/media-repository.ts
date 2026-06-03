import "server-only";

import { createSupabaseServiceRoleClient } from "@/server/db/supabase";
import {
  createMediaAssetSchema,
  mapDbRowToMediaAssetDto,
  type MediaAssetDto,
  type CreateMediaAssetInput,
} from "@/server/validators/media";

export async function createMediaAsset(
  input: CreateMediaAssetInput,
  adminId: string
): Promise<MediaAssetDto> {
  const client = createSupabaseServiceRoleClient();

  if (!client) {
    throw new Error("Database not available");
  }

  const validated = createMediaAssetSchema.parse(input);

  const { data, error } = await client
    .from("media_assets")
    .insert({
      provider: "imagekit",
      storage_key: validated.storageKey,
      url: validated.url,
      alt_text: validated.altText ?? null,
      mime_type: validated.mimeType,
      width: validated.width ?? null,
      height: validated.height ?? null,
      size_bytes: validated.sizeBytes ?? null,
      folder: validated.folder ?? null,
      is_public: true,
      created_by: adminId,
    })
    .select()
    .single();

  if (error) {
    throw new Error("Failed to create media asset");
  }

  return mapDbRowToMediaAssetDto(data);
}

export async function getMediaAssets(
  folder?: string
): Promise<MediaAssetDto[]> {
  const client = createSupabaseServiceRoleClient();

  if (!client) {
    throw new Error("Database not available");
  }

  let query = client
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (folder) {
    query = query.eq("folder", folder);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Failed to fetch media assets");
  }

  return data.map(mapDbRowToMediaAssetDto);
}

export async function getMediaAssetById(
  id: string
): Promise<MediaAssetDto | null> {
  const client = createSupabaseServiceRoleClient();

  if (!client) {
    throw new Error("Database not available");
  }

  const { data, error } = await client
    .from("media_assets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error("Failed to fetch media asset");
  }

  return mapDbRowToMediaAssetDto(data);
}