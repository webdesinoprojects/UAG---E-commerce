import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/server/auth/admin";
import {
  createMediaAsset,
  searchMediaAssetsForAdmin,
} from "@/server/repositories/media-repository";
import {
  createMediaAssetSchema,
  mediaSearchParamsSchema,
} from "@/server/validators/media";
import {
  getFileSizeLimit,
  isMimeTypeAllowed,
  isMimeTypeDisallowed,
} from "@/features/media/types";
import {
  getImagekitEnv,
  isImagekitAssetUrl,
  isSafeImagekitStorageKey,
} from "@/server/media/imagekit";

const ADMIN_MEDIA_GET_HEADERS = {
  "Cache-Control": "no-store",
};

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const imagekitEnv = getImagekitEnv();
    if (!imagekitEnv) {
      return NextResponse.json(
        { error: "ImageKit not configured" },
        { status: 503 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const parsed = createMediaAssetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { mimeType, sizeBytes, url, storageKey } = parsed.data;

    if (isMimeTypeDisallowed(mimeType)) {
      return NextResponse.json(
        { error: "SVG files are not allowed" },
        { status: 400 }
      );
    }

    if (!isMimeTypeAllowed(mimeType)) {
      return NextResponse.json(
        { error: "MIME type not allowed" },
        { status: 400 }
      );
    }

    const sizeLimit = getFileSizeLimit(mimeType);
    if (sizeBytes > sizeLimit) {
      const sizeLimitMb = Math.round(sizeLimit / 1024 / 1024);

      return NextResponse.json(
        { error: `File size exceeds maximum allowed (${sizeLimitMb}MB)` },
        { status: 400 }
      );
    }

    if (!isSafeImagekitStorageKey(storageKey)) {
      return NextResponse.json(
        { error: "Invalid storage key" },
        { status: 400 }
      );
    }

    if (!isImagekitAssetUrl(url)) {
      return NextResponse.json(
        { error: "Invalid asset URL" },
        { status: 400 }
      );
    }

    const asset = await createMediaAsset(parsed.data, admin.id);

    return NextResponse.json(asset, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: ADMIN_MEDIA_GET_HEADERS }
    );
  }

  const { searchParams } = new URL(request.url);

  const parsed = mediaSearchParamsSchema.safeParse({
    query: searchParams.get("query") ?? "",
    folder: searchParams.get("folder") ?? "",
    type: searchParams.get("type") ?? "all",
    page: searchParams.get("page") ?? "1",
    pageSize: searchParams.get("pageSize") ?? "24",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters" },
      { status: 400, headers: ADMIN_MEDIA_GET_HEADERS }
    );
  }

  try {
    const result = await searchMediaAssetsForAdmin(parsed.data);
    return NextResponse.json(result, { headers: ADMIN_MEDIA_GET_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: ADMIN_MEDIA_GET_HEADERS }
    );
  }
}
