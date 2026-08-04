import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { extname } from "node:path";
import { createClient } from "@supabase/supabase-js";

const commit = process.argv.includes("--commit");

if (typeof process.loadEnvFile === "function" && existsSync(".env")) {
  process.loadEnvFile(".env");
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const imagekitPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? process.env.IMAGE_KIT_PRIVATE_KEY;
const imagekitUrlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? process.env.IMAGE_KIT_URL;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.");
  process.exit(1);
}

if (!imagekitPrivateKey || !imagekitUrlEndpoint) {
  console.error("ImageKit private key and URL endpoint are required in .env.");
  process.exit(1);
}

try {
  new URL(imagekitUrlEndpoint);
} catch {
  console.error("The configured ImageKit URL endpoint is invalid.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: assets, error: assetError } = await supabase
  .from("media_assets")
  .select("id,url,alt_text,mime_type")
  .eq("provider", "external")
  .eq("folder", "woocommerce-products")
  .order("created_at", { ascending: true });

if (assetError) {
  console.error(`Failed to load external product images: ${assetError.message}`);
  process.exit(1);
}

console.log(`Found ${assets.length} external WooCommerce product images.`);
if (!commit) {
  console.log("Dry run complete. Re-run with --commit to upload to ImageKit and update Supabase.");
  process.exit(0);
}

const extensionFor = (assetUrl, mimeType) => {
  try {
    const extension = extname(new URL(assetUrl).pathname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(extension)) return extension;
  } catch {
    // The upload request will report an invalid source URL below.
  }
  return ({
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  })[mimeType] ?? ".jpg";
};

const uploadToImageKit = async (asset) => {
  const hash = createHash("sha256").update(asset.url).digest("hex");
  const fileName = `${hash}${extensionFor(asset.url, asset.mime_type)}`;
  const sourceResponse = await fetch(asset.url, {
    headers: {
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (compatible; UAG-Image-Migration/1.0)",
    },
    signal: AbortSignal.timeout(60_000),
  });
  if (!sourceResponse.ok) throw new Error(`Source download failed with HTTP ${sourceResponse.status}.`);
  const contentType = sourceResponse.headers.get("content-type")?.split(";")[0] ?? asset.mime_type ?? "image/jpeg";
  if (!contentType.startsWith("image/")) throw new Error(`Source returned unsupported content type ${contentType}.`);
  const sourceBytes = await sourceResponse.arrayBuffer();
  if (sourceBytes.byteLength === 0) throw new Error("Source returned an empty file.");
  if (sourceBytes.byteLength > 25 * 1024 * 1024) throw new Error("Source image exceeds the 25 MB migration limit.");

  const form = new FormData();
  form.set("file", new Blob([sourceBytes], { type: contentType }), fileName);
  form.set("fileName", fileName);
  form.set("folder", "/uag-products/woocommerce");
  form.set("useUniqueFileName", "false");
  form.set("overwriteFile", "true");
  form.set("tags", "uag-product,woocommerce-import");

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${imagekitPrivateKey}:`).toString("base64")}`,
    },
    body: form,
    signal: AbortSignal.timeout(60_000),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message ?? payload?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(message);
  }
  if (!payload?.url || !payload?.filePath) throw new Error("ImageKit returned an incomplete upload response.");
  return payload;
};

const migrateAsset = async (asset) => {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const uploaded = await uploadToImageKit(asset);
      const { error } = await supabase
        .from("media_assets")
        .update({
          provider: "imagekit",
          storage_key: String(uploaded.filePath).replace(/^\/+/, ""),
          url: uploaded.url,
          width: Number.isInteger(uploaded.width) ? uploaded.width : null,
          height: Number.isInteger(uploaded.height) ? uploaded.height : null,
          size_bytes: Number.isFinite(uploaded.size) ? uploaded.size : null,
        })
        .eq("id", asset.id)
        .eq("provider", "external");
      if (error) throw new Error(`Supabase update failed: ${error.message}`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 750));
    }
  }
  throw lastError;
};

let cursor = 0;
let completed = 0;
const failures = [];
const worker = async () => {
  while (cursor < assets.length) {
    const index = cursor;
    cursor += 1;
    const asset = assets[index];
    try {
      await migrateAsset(asset);
      completed += 1;
      console.log(`[${completed}/${assets.length}] Migrated media asset ${asset.id}`);
    } catch (error) {
      failures.push({ id: asset.id, message: error instanceof Error ? error.message : "Unknown migration error" });
      console.error(`[FAILED] ${asset.id}: ${failures.at(-1).message}`);
    }
  }
};

await Promise.all(Array.from({ length: Math.min(4, assets.length) }, () => worker()));

console.log(`Migration finished: ${completed} succeeded, ${failures.length} failed.`);
if (failures.length) {
  console.error("Re-run the same command to retry only the remaining external assets.");
  process.exit(1);
}
