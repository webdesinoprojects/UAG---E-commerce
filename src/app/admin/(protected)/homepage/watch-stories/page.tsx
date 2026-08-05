import { requireAdmin } from "@/server/auth/admin";
import { readAdminHomepageWatchStories } from "@/server/repositories/homepage-repository";
import WatchStoriesEditor from "./_components/watch-stories-editor";

export const metadata = {
  title: "Watch Stories CMS | UAG E-commerce",
};

export default async function WatchStoriesPage() {
  await requireAdmin();
  const watchStories = await readAdminHomepageWatchStories();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6">
      <WatchStoriesEditor initialData={watchStories} />
    </div>
  );
}
