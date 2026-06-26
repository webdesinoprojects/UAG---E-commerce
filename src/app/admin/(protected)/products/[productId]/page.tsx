import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/auth/admin";
import {
  readAdminProductById,
  readAdminCatalogCategories,
} from "@/server/repositories/catalog-repository";
import ProductEditForm from "./_components/product-edit-form";
import { ProductMediaManager } from "./_components/product-media-manager";

export const metadata = {
  title: "Edit Product | UAG E-commerce",
};

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  await requireAdmin();

  const { productId } = await params;

  const [product, categories] = await Promise.all([
    readAdminProductById(productId),
    readAdminCatalogCategories(),
  ]);

  if (!product) notFound();

  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <ProductEditForm
        product={product}
        categoryOptions={categoryOptions}
      />
      <ProductMediaManager
        productId={product.id}
        initialMedia={product.mediaItems}
      />
    </div>
  );
}
