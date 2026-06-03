import { requireAdmin } from "@/server/auth/admin";
import { readAdminHomepageHeroCarousel } from "@/server/repositories/homepage-repository";
import { HeroCarouselEditor } from "./_components/hero-carousel-editor";

export default async function HeroCarouselEditorPage() {
  await requireAdmin();
  const heroCarousel = await readAdminHomepageHeroCarousel();

  return <HeroCarouselEditor heroCarousel={heroCarousel} />;
}
