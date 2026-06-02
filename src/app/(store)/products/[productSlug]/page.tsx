import React, { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getAllProducts } from "@/features/catalog/queries";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { ProductInfo } from "@/features/catalog/components/product-info";
import { ProductTabs } from "@/features/catalog/components/product-tabs";
import { TrackViewedProduct } from "@/features/catalog/components/track-viewed-product";
import { RecentlyViewedCarousel } from "@/features/catalog/components/recently-viewed-carousel";
import { ProductReviews } from "@/features/catalog/components/product-reviews";
import { ExpandableText } from "@/components/ui/expandable-text";

interface ProductPageProps {
  params: Promise<{ productSlug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  // In Next.js 15+, params is a Promise. We must await it.
  const { productSlug } = await params;

  // Fetch the product data
  const product = await getProductBySlug(productSlug);
  const allProducts = await getAllProducts();

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      {/* Track that this product was viewed */}
      <TrackViewedProduct productSlug={product.slug} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-6 sm:mb-8 whitespace-nowrap overflow-hidden text-ellipsis">
          <Link href="/" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <Link href="/catalog" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Categories</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/catalog?category=${product.category.toLowerCase().replace(/ /g, '-')}`} className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="w-3 h-3" />
          </div>

          <span className="text-zinc-900 dark:text-zinc-100 truncate">
            {product.name}
          </span>
        </nav>

        {/* Main PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-16">
          
          {/* Left: Product Gallery */}
          <section className="w-full">
            <ProductGallery media={product.media} />
          </section>

          {/* Right: Product Info */}
          <section className="w-full lg:sticky lg:top-24">
            <ProductInfo product={product} />
          </section>

        </div>

        {/* Features & Compatibility Section */}
        {product.featuresAndCompatibility && (
          <section className="border-t border-zinc-200 dark:border-zinc-800 pt-12 lg:pt-16 mt-8">
            <h2 className="text-xl md:text-2xl font-medium text-zinc-800 dark:text-zinc-100 mb-6">
              Features & Compatibility
            </h2>
            <ExpandableText 
              text={product.featuresAndCompatibility} 
              className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-[1.8]" 
            />
          </section>
        )}

        {/* Promises / Trust Badges Section */}
        {product.promises && product.promises.length > 0 && (
          <section className="mt-12 lg:mt-16">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {product.promises.map((promise, idx) => {
                // Dynamically select an icon based on string
                const IconComponent = 
                  promise.icon === "Percent" ? require("lucide-react").Percent :
                  promise.icon === "RefreshCw" ? require("lucide-react").RefreshCw :
                  promise.icon === "ShieldCheck" ? require("lucide-react").ShieldCheck :
                  promise.icon === "Truck" ? require("lucide-react").Truck :
                  promise.icon === "MapPin" ? require("lucide-react").MapPin :
                  require("lucide-react").PackageCheck;

                return (
                  <div key={idx} className="bg-[#f8f8f8] dark:bg-zinc-900 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 aspect-[4/3]">
                    <IconComponent className="w-10 h-10 text-[#00478f] dark:text-blue-500 mb-1" strokeWidth={2.5} />
                    <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">
                      {promise.title}
                      <br />
                      <span className="font-medium text-zinc-600 dark:text-zinc-400">{promise.subtitle}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bento Grid Section */}
        {product.bentoImages && product.bentoImages.length >= 5 && (
          <section className="mt-12 lg:mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-2 sm:gap-4 h-[600px] md:h-[600px]">
              {/* Image 1: Large hero (2x2) */}
              {product.bentoImages[0] && (
                <div className="col-span-2 row-span-2 relative bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden group">
                  <Image src={product.bentoImages[0]} alt="Feature 1" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              {/* Image 2 */}
              {product.bentoImages[1] && (
                <div className="col-span-1 row-span-1 relative bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden group">
                  <Image src={product.bentoImages[1]} alt="Feature 2" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              {/* Image 3 */}
              {product.bentoImages[2] && (
                <div className="col-span-1 row-span-1 relative bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden group">
                  <Image src={product.bentoImages[2]} alt="Feature 3" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              {/* Image 4 */}
              {product.bentoImages[3] && (
                <div className="col-span-1 row-span-1 relative bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden group">
                  <Image src={product.bentoImages[3]} alt="Feature 4" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              {/* Image 5 */}
              {product.bentoImages[4] && (
                <div className="col-span-1 row-span-1 relative bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden group">
                  <Image src={product.bentoImages[4]} alt="Feature 5" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tabbed Detailed Description & Shipping Policy */}
        <ProductTabs 
          detailedDescription={product.detailedDescription} 
          shippingPolicy={product.shippingPolicy} 
        />

      </div>

      {/* Recently Viewed Carousel */}
      <RecentlyViewedCarousel 
        allProducts={allProducts} 
        currentProductSlug={product.slug} 
      />

      {/* Customer Reviews Section */}
      {product.reviews && (
        <ProductReviews reviews={product.reviews} />
      )}

    </div>
  );
}
