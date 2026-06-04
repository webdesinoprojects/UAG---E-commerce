import { requireAdmin } from "@/server/auth/admin";
import { readAdminHomepageMerchandisingBanners } from "@/server/repositories/homepage-repository";
import { getMediaAssets } from "@/server/repositories/media-repository";
import MerchandisingEditor from "./_components/merchandising-editor";

export const metadata = {
  title: "Merchandising CMS | UAG E-commerce",
};

export default async function MerchandisingPage() {
  await requireAdmin();

  const [merchandisingBanners, mediaAssets] = await Promise.all([
    readAdminHomepageMerchandisingBanners(),
    getMediaAssets(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6">
      <MerchandisingEditor
        initialData={merchandisingBanners}
        mediaAssets={mediaAssets}
      />
    </div>
  );
}
