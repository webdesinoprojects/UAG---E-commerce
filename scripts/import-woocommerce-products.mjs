import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const commit = args.includes("--commit");
const csvArgument = args.find((arg) => !arg.startsWith("--"));

if (!csvArgument) {
  console.error("Usage: npm run seed:products -- <csv-file> [--commit]");
  process.exit(1);
}

if (typeof process.loadEnvFile === "function" && existsSync(".env")) {
  process.loadEnvFile(".env");
}

const csvPath = resolve(csvArgument);
if (!existsSync(csvPath)) {
  console.error(`CSV file not found: ${csvPath}`);
  process.exit(1);
}

const rows = parse(readFileSync(csvPath), {
  bom: true,
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
  trim: true,
});

const text = (value) => String(value ?? "").trim();
const flag = (value) => ["1", "true", "yes"].includes(text(value).toLowerCase());
const optionalText = (value) => text(value) || null;
const numberOrNull = (value) => {
  const cleaned = text(value).replace(/,/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};
const moneyToPaise = (value) => {
  const amount = numberOrNull(value);
  return amount === null ? null : Math.max(0, Math.round(amount * 100));
};
const slugify = (value) =>
  text(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
const splitList = (value) => text(value).split(",").map((item) => item.trim()).filter(Boolean);
const categoryAliases = new Map([
  ["earbuds or airdopes enc", "Earbuds"],
  ["neckband with magnetic sensor or enc", "Neckbands"],
  ["portable & party speaker with clear bass", "Bluetooth Speaker"],
  ["power bank fast charge technology", "Power Banks"],
  ["smart watch with calling", "Smart Watch"],
]);
const storefrontCategory = (name) => categoryAliases.get(name.toLowerCase()) ?? name;
const validHttpUrl = (value) => {
  try {
    const url = new URL(text(value));
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
};
const dateOrNull = (value) => {
  if (!text(value)) return null;
  const date = new Date(text(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};
const mimeFromUrl = (url) => {
  const extension = extname(new URL(url).pathname).toLowerCase();
  return ({ ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif" })[extension] ?? "image/jpeg";
};

const errors = [];
const seenSkus = new Set();
const normalized = rows.map((row, index) => {
  const line = index + 2;
  const wooId = text(row.ID);
  const name = text(row.Name);
  const sku = text(row.SKU);
  const sourceCategories = splitList(row.Categories);
  const categories = [...new Set(sourceCategories.map(storefrontCategory))];
  const images = splitList(row.Images).map(validHttpUrl).filter(Boolean);
  const regularPrice = moneyToPaise(row["Regular price"]);
  const salePrice = moneyToPaise(row["Sale price"]);
  const saleStartsAt = dateOrNull(row["Date sale price starts"]);
  const saleEndsAt = dateOrNull(row["Date sale price ends"]);
  const now = Date.now();
  const saleIsActive = salePrice !== null
    && (!saleStartsAt || new Date(saleStartsAt).getTime() <= now)
    && (!saleEndsAt || new Date(saleEndsAt).getTime() >= now);

  if (!wooId) errors.push(`Line ${line}: missing ID.`);
  if (!name) errors.push(`Line ${line}: missing product name.`);
  if (!sku) errors.push(`Line ${line}: missing SKU.`);
  if (sku && seenSkus.has(sku)) errors.push(`Line ${line}: duplicate SKU ${sku}.`);
  seenSkus.add(sku);
  if (regularPrice === null && salePrice === null) errors.push(`Line ${line}: missing price.`);
  if (!categories.length) errors.push(`Line ${line}: missing category.`);
  if (!images.length) errors.push(`Line ${line}: no valid image URLs.`);

  const stockValue = numberOrNull(row.Stock);
  const inStock = flag(row["In stock?"]);
  const stockQuantity = stockValue === null ? (inStock ? 9999 : 0) : Math.max(0, Math.floor(stockValue));
  const lowStock = numberOrNull(row["Low stock amount"]);
  const priceCents = saleIsActive ? salePrice : (regularPrice ?? salePrice ?? 0);
  const compareAtPriceCents = saleIsActive && regularPrice !== null && regularPrice > priceCents
    ? regularPrice
    : null;
  const specifications = [
    ["WooCommerce ID", wooId],
    ["Product type", text(row.Type)],
    ["GTIN / UPC / EAN / ISBN", text(row["GTIN, UPC, EAN, or ISBN"])],
    ["Visibility", text(row["Visibility in catalog"])],
    ["Tax status", text(row["Tax status"])],
    ["Tax class", text(row["Tax class"])],
    ["Weight", text(row["Weight (g)"]) ? `${text(row["Weight (g)"])} g` : ""],
    ["Length", text(row["Length (cm)"]) ? `${text(row["Length (cm)"])} cm` : ""],
    ["Width", text(row["Width (cm)"]) ? `${text(row["Width (cm)"])} cm` : ""],
    ["Height", text(row["Height (cm)"]) ? `${text(row["Height (cm)"])} cm` : ""],
    ["Customer reviews", flag(row["Allow customer reviews?"]) ? "Allowed" : "Disabled"],
    ["Inventory managed", stockValue === null ? "No" : "Yes"],
    ["Backorders", flag(row["Backorders allowed?"]) ? "Allowed" : "Not allowed"],
    ["Sold individually", flag(row["Sold individually?"]) ? "Yes" : "No"],
    ["Sale starts", saleStartsAt ?? ""],
    ["Sale ends", saleEndsAt ?? ""],
    ["Categories", sourceCategories.join(", ")],
    ["Tags", text(row.Tags)],
    ["Shipping class", text(row["Shipping class"])],
  ].filter(([, value]) => value).map(([label, value]) => ({ label, value }));

  return {
    line,
    wooId,
    categories,
    images,
    product: {
      name,
      slug: `${slugify(name)}-wc-${slugify(wooId)}`,
      product_url: validHttpUrl(row["External URL"]),
      sku,
      brand: text(row.Brands) || "UAG Urbn Armour Gear",
      short_description: optionalText(row["Short description"]),
      description: optionalText(row.Description),
      price_cents: priceCents,
      compare_at_price_cents: compareAtPriceCents,
      currency: "INR",
      stock_quantity: stockQuantity,
      low_stock_threshold: lowStock === null ? 5 : Math.max(0, Math.floor(lowStock)),
      status: flag(row.Published) ? "active" : "draft",
      is_featured: flag(row["Is featured?"]),
      is_new_arrival: false,
      is_popular: false,
      published_at: flag(row.Published) ? new Date().toISOString() : null,
      specifications,
      shipping_policy: optionalText(row["Purchase note"]),
      sort_order: Math.max(0, Math.floor(numberOrNull(row.Position) ?? index)),
    },
  };
});

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const categoryNames = [...new Set(normalized.flatMap((row) => row.categories))];
const imageCount = normalized.reduce((total, row) => total + row.images.length, 0);
console.log(`Validated ${normalized.length} products, ${categoryNames.length} categories and ${imageCount} images from ${basename(csvPath)}.`);

if (!commit) {
  console.log("Dry run complete. Re-run with --commit to write to Supabase.");
  process.exit(0);
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const chunks = (values, size) => {
  const result = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
};

const categoryRows = categoryNames.map((name, index) => ({
  name,
  slug: slugify(name),
  is_active: true,
  sort_order: index * 10,
}));
const { data: savedCategories, error: categoryError } = await supabase
  .from("catalog_categories")
  .upsert(categoryRows, { onConflict: "slug" })
  .select("id,name");
if (categoryError || !savedCategories) throw new Error(`Failed to upsert categories: ${categoryError?.message ?? "no rows returned"}`);
const categoryIds = new Map(savedCategories.map((category) => [category.name, category.id]));
console.log(`Upserted ${savedCategories.length} categories.`);

const productRows = normalized.map((item) => ({
  ...item.product,
  category_id: categoryIds.get(item.categories[0]) ?? null,
}));
const { data: savedProducts, error: productError } = await supabase
  .from("catalog_products")
  .upsert(productRows, { onConflict: "sku" })
  .select("id,sku");
if (productError || !savedProducts) throw new Error(`Failed to upsert products: ${productError?.message ?? "no rows returned"}`);
const productIds = new Map(savedProducts.map((product) => [product.sku, product.id]));
console.log(`Upserted ${savedProducts.length} products.`);

const uniqueImages = new Map();
for (const item of normalized) {
  for (const imageUrl of item.images) {
    const storageKey = `woocommerce/${createHash("sha256").update(imageUrl).digest("hex")}`;
    if (!uniqueImages.has(storageKey)) {
      uniqueImages.set(storageKey, {
        provider: "external",
        storage_key: storageKey,
        url: imageUrl,
        alt_text: item.product.name,
        mime_type: mimeFromUrl(imageUrl),
        folder: "woocommerce-products",
        is_public: true,
      });
    }
  }
}

const mediaIds = new Map();
for (const storageKeyBatch of chunks([...uniqueImages.keys()], 75)) {
  const { data, error } = await supabase
    .from("media_assets")
    .select("id,storage_key")
    .in("storage_key", storageKeyBatch);
  if (error) throw new Error(`Failed to check existing media: ${error.message}`);
  for (const media of data ?? []) {
    if (!mediaIds.has(media.storage_key)) mediaIds.set(media.storage_key, media.id);
  }
}

const missingImages = [...uniqueImages.entries()]
  .filter(([storageKey]) => !mediaIds.has(storageKey))
  .map(([, media]) => media);
for (const mediaBatch of chunks(missingImages, 100)) {
  const { data, error } = await supabase
    .from("media_assets")
    .insert(mediaBatch)
    .select("id,storage_key");
  if (error || !data) throw new Error(`Failed to insert media: ${error?.message ?? "no rows returned"}`);
  for (const media of data) mediaIds.set(media.storage_key, media.id);
}
console.log(`Resolved ${mediaIds.size} unique media assets (${missingImages.length} newly inserted).`);

const mediaLinks = normalized.flatMap((item) => {
  const productId = productIds.get(item.product.sku);
  if (!productId) throw new Error(`No saved product ID returned for SKU ${item.product.sku}.`);
  return item.images.map((imageUrl, imageIndex) => {
    const storageKey = `woocommerce/${createHash("sha256").update(imageUrl).digest("hex")}`;
    const mediaId = mediaIds.get(storageKey);
    if (!mediaId) throw new Error(`No media ID resolved for ${imageUrl}.`);
    return {
      product_id: productId,
      media_asset_id: mediaId,
      placement: imageIndex === 0 ? "thumbnail" : "gallery",
      alt_text: item.product.name,
      sort_order: imageIndex,
      is_primary: imageIndex === 0,
      is_enabled: true,
      settings: { source: "woocommerce", wooProductId: item.wooId },
    };
  });
});

for (const productIdBatch of chunks([...productIds.values()], 75)) {
  const { error } = await supabase.from("catalog_product_media").delete().in("product_id", productIdBatch);
  if (error) throw new Error(`Failed to refresh product media: ${error.message}`);
}
for (const linkBatch of chunks(mediaLinks, 100)) {
  const { error } = await supabase.from("catalog_product_media").insert(linkBatch);
  if (error) throw new Error(`Failed to link product media: ${error.message}`);
}

console.log(`Imported ${savedProducts.length} products with ${mediaLinks.length} image links successfully.`);
