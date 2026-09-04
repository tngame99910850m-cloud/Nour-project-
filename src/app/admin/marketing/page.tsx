import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { MarketingManager } from "@/components/dashboard/marketing-manager";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const [banners, testimonials, featured, bestSellers, newArrivals, onSale] = await Promise.all([
    prisma.banner.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.count({ where: { isFeatured: true } }),
    prisma.product.count({ where: { isBestSeller: true } }),
    prisma.product.count({ where: { isNew: true } }),
    prisma.product.count({ where: { salePrice: { not: null } } }),
  ]);

  return (
    <div>
      <PageHeader title="Marketing" description="Manage homepage banners, testimonials and promotional highlights." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Featured products", value: featured, href: "/admin/products" },
          { label: "Best sellers", value: bestSellers, href: "/admin/products" },
          { label: "New arrivals", value: newArrivals, href: "/admin/products" },
          { label: "On sale", value: onSale, href: "/admin/products" },
        ].map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition hover:shadow-card">
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold">{s.value}</p>
              <p className="mt-1 text-xs text-brand">Manage in Products →</p>
            </Card>
          </Link>
        ))}
      </div>

      <MarketingManager
        banners={banners.map((b) => ({ id: b.id, title: b.title, subtitle: b.subtitle, image: b.image, ctaText: b.ctaText, ctaLink: b.ctaLink, isActive: b.isActive, sortOrder: b.sortOrder }))}
        testimonials={testimonials.map((t) => ({ id: t.id, name: t.name, text: t.text, rating: t.rating, isActive: t.isActive, sortOrder: t.sortOrder }))}
      />
    </div>
  );
}
