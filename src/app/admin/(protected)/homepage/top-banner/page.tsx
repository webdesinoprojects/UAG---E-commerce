import { requireAdmin } from "@/server/auth/admin";
import { readAdminHomepageAnnouncement } from "@/server/repositories/homepage-repository";
import { TopBannerEditor } from "./_components/top-banner-editor";

export default async function TopBannerEditorPage() {
  await requireAdmin();
  const announcement = await readAdminHomepageAnnouncement();

  return <TopBannerEditor announcement={announcement} />;
}
