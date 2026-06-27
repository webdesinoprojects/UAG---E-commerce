import { requireAdmin } from "@/server/auth/admin";
import { readAdminProductList } from "@/server/repositories/catalog-repository";
import ProductsListClient from "./_components/products-list-client";

export const metadata = {
  title: "Products | UAG E-commerce",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const [products, params] = await Promise.all([
    readAdminProductList(),
    searchParams,
  ]);

  const toastMessage =
    params.created === "1"
      ? "Product created."
      : params.updated === "1"
      ? "Product updated."
      : null;

  const initialSearch = typeof params.q === "string" ? params.q : "";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <ProductsListClient products={products} toastMessage={toastMessage} initialSearch={initialSearch} />
    </div>
  );
}
