import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <SiteFooter />
    </div>
  );
}
