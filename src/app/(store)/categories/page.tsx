import { notFound, redirect } from "next/navigation";
import { getCatalogCategories } from "@/features/catalog/queries";

export default async function CategoriesIndexPage() {
  const categories = await getCatalogCategories();

  const first = categories[0];
  if (!first) {
    notFound();
  }

  redirect(`/categories/${first.slug}`);
}
