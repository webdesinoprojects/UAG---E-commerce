import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/auth/admin";
import { readAdminContentPage } from "@/server/repositories/content-pages-repository";
import { parseContentPageKey } from "@/server/validators/content-pages";
import { ContentPageEditor } from "./_components/content-page-editor";

interface AdminContentPageProps {
  params: Promise<{ pageKey: string }>;
}

export default async function AdminContentPage({ params }: AdminContentPageProps) {
  await requireAdmin();
  const { pageKey } = await params;
  const key = parseContentPageKey(pageKey);

  if (!key) {
    notFound();
  }

  const page = await readAdminContentPage(key);

  return <ContentPageEditor page={page} />;
}
