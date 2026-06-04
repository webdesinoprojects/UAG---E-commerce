import { requireAdmin } from "@/server/auth/admin";
import { readAdminHomepageCategoryCircles } from "@/server/repositories/homepage-repository";
import CategoriesEditor from "./_components/categories-editor";

export const metadata = {
  title: "Categories Showcase CMS | UAG E-commerce",
};

export default async function CategoriesPage() {
  await requireAdmin();

  const categoryCircles = await readAdminHomepageCategoryCircles();

  return (
    <div className="flex-1 w-full flex flex-col p-6 overflow-hidden max-w-7xl mx-auto">
      <div className="flex flex-col mb-8 gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Categories Showcase
        </h1>
        <p className="text-zinc-500 text-sm">
          Manage the homepage category circles row displayed above the hero carousel.
        </p>
      </div>

      <CategoriesEditor initialData={categoryCircles} />
    </div>
  );
}
