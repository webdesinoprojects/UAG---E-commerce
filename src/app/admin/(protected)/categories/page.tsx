import { requireAdmin } from "@/server/auth/admin";
import { readAdminCatalogCategories } from "@/server/repositories/catalog-repository";
import CategoriesManager from "./_components/categories-manager";

export const metadata = {
  title: "Catalog Categories | UAG E-commerce",
};

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await readAdminCatalogCategories();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <CategoriesManager categories={categories} />
    </div>
  );
}
