import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/ui";
import { ProductForm } from "@/components/dashboard/product-form";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <PageHeader title="Add Product" />
      <ProductForm
        action={createProduct}
        categories={categories.map((c) => ({ id: c.id, name: c.name, group: c.group }))}
        submitLabel="Create Product"
      />
    </div>
  );
}
