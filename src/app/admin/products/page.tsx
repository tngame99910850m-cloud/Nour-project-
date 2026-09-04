import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { money, effectivePrice } from "@/lib/format";
import { toNumber } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/ui";
import { ProductRowActions } from "@/components/dashboard/product-row-actions";
import { TableSearch } from "@/components/dashboard/table-search";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const business = await getBusinessSettings();
  const cur = business.currencySymbol;

  const where: Prisma.ProductWhereInput = sp.q
    ? { OR: [{ name: { contains: sp.q, mode: "insensitive" } }, { sku: { contains: sp.q, mode: "insensitive" } }] }
    : {};

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${products.length} products`}
        action={<Link href="/admin/products/new" className="btn-primary btn-md"><Plus className="h-4 w-4" /> Add Product</Link>}
      />

      <TableSearch placeholder="Search products by name or SKU…" basePath="/admin/products" initial={sp.q} />

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 bg-surface">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {products.map((p) => {
                const price = effectivePrice(p.price, p.salePrice);
                const low = p.stock <= p.lowStockLevel;
                return (
                  <tr key={p.id} className="hover:bg-canvas/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-canvas">
                          {p.images[0] ? <Image src={p.images[0]} alt={p.name} fill sizes="44px" className="object-cover" /> : null}
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted">{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.category.name}</td>
                    <td className="px-4 py-3">
                      {money(price, cur)}
                      {p.salePrice ? <span className="ml-1 text-xs text-muted line-through">{money(toNumber(p.price), cur)}</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.stock === 0 ? "bg-red-100 text-red-700" : low ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.isFeatured ? <span className="badge bg-brand/10 text-brand">Featured</span> : null}
                        {p.isBestSeller ? <span className="badge bg-ink/10 text-ink">Best</span> : null}
                        {p.isNew ? <span className="badge bg-accent/20 text-accent">New</span> : null}
                        {!p.isAvailable ? <span className="badge bg-gray-100 text-gray-600">Hidden</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ProductRowActions id={p.id} slug={p.slug} />
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted">No products yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
