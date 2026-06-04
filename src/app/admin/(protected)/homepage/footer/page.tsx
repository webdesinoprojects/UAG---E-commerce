import { requireAdmin } from "@/server/auth/admin";
import { readAdminSiteFooter } from "@/server/repositories/homepage-repository";
import FooterEditor from "./_components/footer-editor";

export const metadata = {
  title: "Footer Settings CMS | UAG E-commerce",
};

export default async function FooterSettingsPage() {
  await requireAdmin();

  const footer = await readAdminSiteFooter();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6">
      <FooterEditor initialData={footer} />
    </div>
  );
}
