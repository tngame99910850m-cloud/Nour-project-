import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/ui";
import { ProductForm } from "@/components/dashboard/product-form";
import { updateProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: [{ group: "asc" }, { sortOrder: "asc" }] }),
  ]);
  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);

  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <PageHeader title="Edit Product" description={product.sku} />
      <ProductForm
        action={updateWithId}
        categories={categories.map((c) => ({ id: c.id, name: c.name, group: c.group }))}
        submitLabel="Save Changes"
        initial={{
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          shortDesc: product.shortDesc ?? "",
          price: toNumber(product.price),
          salePrice: product.salePrice == null ? null : toNumber(product.salePrice),
          cost: product.cost == null ? null : toNumber(product.cost),
          images: product.images,
          stock: product.stock,
          lowStockLevel: product.lowStockLevel,
          categoryId: product.categoryId,
          isAvailable: product.isAvailable,
          isFeatured: product.isFeatured,
          isBestSeller: product.isBestSeller,
          isNew: product.isNew,
          tags: product.tags,
          metaTitle: product.metaTitle ?? "",
          metaDescription: product.metaDescription ?? "",
        }}
      />
    </div>
  );
}
