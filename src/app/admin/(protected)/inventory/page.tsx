import { requireAdmin } from "@/server/auth/admin";
import { readAdminProductList } from "@/server/repositories/catalog-repository";
import InventoryClient from "./_components/inventory-client";

export const metadata = {
  title: "Inventory | UAG E-commerce",
};

export default async function AdminInventoryPage() {
  await requireAdmin();
  const products = await readAdminProductList();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <InventoryClient products={products} />
    </div>
  );
}
