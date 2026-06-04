import { requireAdmin } from "@/server/auth/admin";
import { readAdminHomepageBentoGallery } from "@/server/repositories/homepage-repository";
import { getMediaAssets } from "@/server/repositories/media-repository";
import BentoGalleryEditor from "./_components/bento-gallery-editor";

export const metadata = {
  title: "Bento Gallery CMS | UAG E-commerce",
};

export default async function BentoGalleryPage() {
  await requireAdmin();

  const [bentoGallery, mediaAssets] = await Promise.all([
    readAdminHomepageBentoGallery(),
    getMediaAssets(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6">
      <BentoGalleryEditor
        initialData={bentoGallery}
        mediaAssets={mediaAssets}
      />
    </div>
  );
}
