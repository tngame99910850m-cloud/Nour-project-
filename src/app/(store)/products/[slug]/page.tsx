import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { getBusinessSettings, getSystemSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/analytics";
import { ProductDetail } from "@/components/store/product-detail";
import { SectionHeader, ProductGrid } from "@/components/store/section";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDesc || product.description.slice(0, 155),
    openGraph: {
      title: product.name,
      description: product.shortDesc || product.description.slice(0, 155),
      images: product.images.slice(0, 1),
    },
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, business, system] = await Promise.all([
    getProductBySlug(slug),
    getBusinessSettings(),
    getSystemSettings(),
  ]);

  if (!product) notFound();

  // Fire-and-forget view tracking
  prisma.product.update({ where: { id: product.id }, data: { views: { increment: 1 } } }).catch(() => {});
  trackEvent("product_view", { productId: product.id, path: `/products/${slug}` });

  const related = await getRelatedProducts(product.categoryId, product.id, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc || product.description,
    sku: product.sku,
    image: product.images,
    offers: {
      "@type": "Offer",
      priceCurrency: business.currency,
      price: product.salePrice ?? product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-px py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail
        product={product}
        business={{
          name: business.name,
          whatsapp: business.whatsapp,
          currencySymbol: business.currencySymbol,
          whatsappOrdering: system.features.whatsappOrdering,
          onlineOrdering: system.features.onlineOrdering,
        }}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL || ""}
      />

      {related.length > 0 ? (
        <div className="mt-20">
          <SectionHeader eyebrow="You may also like" title="Related Products" />
          <ProductGrid products={related} currencySymbol={business.currencySymbol} />
        </div>
      ) : null}
    </div>
  );
}
