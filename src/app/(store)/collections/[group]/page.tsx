import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/catalog";
import { getBusinessSettings } from "@/lib/settings";
import { ProductGrid } from "@/components/store/section";

export const dynamic = "force-dynamic";

const GROUPS: Record<string, { title: string; eyebrow: string; enum: "WEDDING" | "HOME" }> = {
  wedding: { title: "Wedding Collection", eyebrow: "For your big day", enum: "WEDDING" },
  home: { title: "Home Collection", eyebrow: "For your space", enum: "HOME" },
};

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group } = await params;
  const g = GROUPS[group.toLowerCase()];
  return { title: g ? g.title : "Collection" };
}

export default async function CollectionPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  const g = GROUPS[group.toLowerCase()];
  if (!g) notFound();

  const [business, products, subcategories] = await Promise.all([
    getBusinessSettings(),
    prisma.product.findMany({
      where: { isAvailable: true, category: { group: g.enum } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.category.findMany({ where: { group: g.enum, parentId: { not: null }, isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="container-px py-10">
      <div className="mb-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{g.eyebrow}</span>
        <h1 className="section-title mt-2">{g.title}</h1>
      </div>

      {subcategories.length > 0 ? (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {subcategories.map((c) => (
            <Link key={c.slug} href={`/products?category=${c.slug}`} className="rounded-full bg-black/5 px-4 py-2 text-sm hover:bg-brand hover:text-white">
              {c.name}
            </Link>
          ))}
        </div>
      ) : null}

      <ProductGrid products={products.map(serializeProduct)} currencySymbol={business.currencySymbol} />
    </div>
  );
}
