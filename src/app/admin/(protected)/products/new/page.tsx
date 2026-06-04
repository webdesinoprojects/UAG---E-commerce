import { requireAdmin } from "@/server/auth/admin";
import { readAdminCatalogCategories } from "@/server/repositories/catalog-repository";
import { getMediaAssets } from "@/server/repositories/media-repository";
import ProductCreateForm from "./_components/product-create-form";

export const metadata = {
  title: "New Product | UAG E-commerce",
};

export default async function AdminProductNewPage() {
  await requireAdmin();

  const [categories, mediaAssets] = await Promise.all([
    readAdminCatalogCategories(),
    getMediaAssets(),
  ]);

  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <ProductCreateForm categoryOptions={categoryOptions} mediaAssets={mediaAssets} />
    </div>
  );
}
