import { cacheLife, cacheTag } from "next/cache";
import type { ContentPageKey } from "./types";
import { readContentPage } from "@/server/repositories/content-pages-repository";

export const CONTENT_PAGES_CACHE_TAG = "content-pages";

export async function getContentPage(key: ContentPageKey) {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_PAGES_CACHE_TAG);
  cacheTag(`content-page-${key}`);

  return readContentPage(key);
}
