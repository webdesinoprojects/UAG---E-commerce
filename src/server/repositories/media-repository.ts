import "server-only";

import { createSupabaseServiceRoleClient } from "@/server/db/supabase";
import {
  createMediaAssetSchema,
  mapDbRowToMediaAssetDto,
  type MediaAssetDto,
  type CreateMediaAssetInput,
  type MediaSearchInput,
} from "@/server/validators/media";

export interface MediaSearchResult {
  assets: MediaAssetDto[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  folders: string[];
}

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

export async function searchMediaAssetsForAdmin(
  input: MediaSearchInput
): Promise<MediaSearchResult> {
  const client = createSupabaseServiceRoleClient();

  if (!client) {
    return { assets: [], total: 0, page: input.page, pageSize: input.pageSize, pageCount: 0, folders: [] };
  }

  try {
    let query = client
      .from("media_assets")
      .select("*", { count: "exact" });

    if (input.query) {
      const q = input.query;
      const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (UUID_PATTERN.test(q)) {
        // Exact UUID match is safe to use with .eq() without ILIKE interpolation.
        query = query.eq("id", q);
      } else {
        query = query.or(
          [
            `alt_text.ilike.%${q}%`,
            `storage_key.ilike.%${q}%`,
            `url.ilike.%${q}%`,
            `folder.ilike.%${q}%`,
            `mime_type.ilike.%${q}%`,
          ].join(",")
        );
      }
    }

    if (input.folder) {
      query = query.eq("folder", input.folder);
    }

    // ilike is case-insensitive; safer than like for MIME types from varied sources.
    if (input.type === "image") {
      query = query.ilike("mime_type", "image/%");
    } else if (input.type === "gif") {
      query = query.ilike("mime_type", "image/gif");
    } else if (input.type === "video") {
      query = query.ilike("mime_type", "video/%");
    }

    const from = (input.page - 1) * input.pageSize;
    const to = from + input.pageSize - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new Error("Query failed.");

    const total = count ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / input.pageSize));

    // Fetch all distinct folder names for the filter dropdown.
    const { data: folderRows } = await client
      .from("media_assets")
      .select("folder")
      .not("folder", "is", null);

    const folders = [
      ...new Set((folderRows ?? []).map((r) => r.folder).filter((f): f is string => !!f)),
    ].sort();

    return {
      assets: (data ?? []).map(mapDbRowToMediaAssetDto),
      total,
      page: input.page,
      pageSize: input.pageSize,
      pageCount,
      folders,
    };
  } catch {
    throw new Error("Could not fetch media assets.");
  }
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
