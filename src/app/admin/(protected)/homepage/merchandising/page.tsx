import { requireAdmin } from "@/server/auth/admin";
import { readAdminHomepageMerchandisingBanners } from "@/server/repositories/homepage-repository";
import MerchandisingEditor from "./_components/merchandising-editor";

export const metadata = {
  title: "Merchandising CMS | UAG E-commerce",
};

export default async function MerchandisingPage() {
  await requireAdmin();

  const merchandisingBanners = await readAdminHomepageMerchandisingBanners();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6">
      <MerchandisingEditor initialData={merchandisingBanners} />
    </div>
  );
}
