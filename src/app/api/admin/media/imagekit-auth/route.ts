import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/server/auth/admin";
import {
  getImagekitEnv,
  getImagekitUploadAuth,
} from "@/server/media/imagekit";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const env = getImagekitEnv();

    if (!env) {
      return NextResponse.json(
        {
          error:
            "ImageKit not configured. Please set NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT.",
        },
        { status: 503 }
      );
    }

    const auth = getImagekitUploadAuth();

    return NextResponse.json(auth, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
