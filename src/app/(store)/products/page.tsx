import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/catalog";
import { getBusinessSettings } from "@/lib/settings";
import { ProductGrid } from "@/components/store/section";
import { ProductFilters } from "@/components/store/product-filters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Products",
  description: "Browse our full collection of wedding and home products.",
};

interface SearchParams {
  q?: string;
  category?: string;
  group?: string;
  filter?: string;
  sort?: string;
  min?: string;
  max?: string;
  [key: string]: string | undefined;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const business = await getBusinessSettings();

  const where: Prisma.ProductWhereInput = { isAvailable: true };
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { description: { contains: sp.q, mode: "insensitive" } },
      { tags: { has: sp.q.toLowerCase() } },
    ];
  }
  if (sp.category) where.category = { slug: sp.category };
  if (sp.group) where.category = { ...(where.category as object), group: sp.group.toUpperCase() as any };
  if (sp.filter === "new") where.isNew = true;
  if (sp.filter === "sale") where.salePrice = { not: null };
  if (sp.filter === "bestselling") where.isBestSeller = true;
  if (sp.min || sp.max) {
    where.price = {};
    if (sp.min) (where.price as any).gte = Number(sp.min);
    if (sp.max) (where.price as any).lte = Number(sp.max);
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sp.sort === "price-asc") orderBy = { price: "asc" };
  else if (sp.sort === "price-desc") orderBy = { price: "desc" };
  else if (sp.sort === "name") orderBy = { name: "asc" };
  else if (sp.sort === "bestselling") orderBy = { views: "desc" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, orderBy, take: 60 }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: [{ group: "asc" }, { sortOrder: "asc" }] }),
  ]);

  const serialized = products.map(serializeProduct);

  return (
    <div className="container-px py-10">
      <div className="mb-8">
        <h1 className="section-title">All Products</h1>
        <p className="mt-1 text-muted">{serialized.length} products {sp.q ? `matching “${sp.q}”` : ""}</p>
      </div>

      <ProductFilters
        categories={categories.map((c) => ({ name: c.name, slug: c.slug, group: c.group, parentId: c.parentId }))}
        current={sp}
      />

      <div className="mt-8">
        {serialized.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <p className="font-serif text-2xl">No products found</p>
            <p className="mt-2 text-muted">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <ProductGrid products={serialized} currencySymbol={business.currencySymbol} />
        )}
      </div>
    </div>
  );
}
