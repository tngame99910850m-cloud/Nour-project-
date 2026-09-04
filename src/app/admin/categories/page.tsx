import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { CategoryManager } from "@/components/dashboard/category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  const parents = categories.filter((c) => !c.parentId);

  return (
    <div>
      <PageHeader title="Categories" description="Organize your catalog. Categories are editable and reflected across the store." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CategoryManager
            categories={categories.map((c) => ({
              id: c.id, name: c.name, slug: c.slug, group: c.group, parentId: c.parentId,
              image: c.image, isActive: c.isActive, productCount: c._count.products,
            }))}
          />
        </div>
        <Card>
          <h2 className="mb-3 font-semibold">Add category</h2>
          <CategoryManager.AddForm parents={parents.map((p) => ({ id: p.id, name: p.name, group: p.group }))} />
        </Card>
      </div>
    </div>
  );
}
