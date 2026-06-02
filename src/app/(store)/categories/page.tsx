import { redirect } from "next/navigation";

export default function CategoriesIndexPage() {
  // In a real app, this might show a grid of all categories.
  // For now, we redirect to the main earbuds category to show the CLP.
  redirect("/categories/earbuds");
}
