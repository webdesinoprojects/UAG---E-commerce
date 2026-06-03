import { requireAdmin } from "@/server/auth/admin";
import { getImagekitEnv } from "@/server/media/imagekit";
import { getMediaAssets } from "@/server/repositories/media-repository";
import { MediaLibraryClient } from "./_components/media-library-client";

export default async function MediaPage() {
  await requireAdmin();
  const imagekitEnv = getImagekitEnv();
  const assets = await getMediaAssets();

  return (
    <MediaLibraryClient
      assets={assets}
      isImagekitConfigured={!!imagekitEnv}
    />
  );
}