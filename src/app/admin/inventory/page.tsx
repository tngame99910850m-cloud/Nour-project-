import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { PageHeader, Card, StatCard } from "@/components/dashboard/ui";
import { StockAdjuster } from "@/components/dashboard/stock-adjuster";
import { Boxes, AlertTriangle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const MOVEMENT_LABELS: Record<string, string> = {
  RECEIVED: "Stock received",
  SALE: "Sale",
  ADJUSTMENT: "Adjustment",
  RETURN: "Return",
  DAMAGED: "Damaged",
  CORRECTION: "Correction",
};

export default async function InventoryPage() {
  const [products, movements, totals] = await Promise.all([
    prisma.product.findMany({ orderBy: { stock: "asc" }, take: 200, select: { id: true, name: true, sku: true, stock: true, lowStockLevel: true } }),
    prisma.inventoryMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { product: { select: { name: true } }, user: { select: { name: true } } },
    }),
    prisma.product.aggregate({ _sum: { stock: true }, _count: true }),
  ]);

  const low = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockLevel).length;
  const out = products.filter((p) => p.stock === 0).length;

  return (
    <div>
      <PageHeader title="Inventory" description="Track stock levels and record inventory movements." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total units in stock" value={totals._sum.stock ?? 0} icon={Boxes} accent="brand" />
        <StatCard label="Low-stock products" value={low} icon={AlertTriangle} accent="amber" />
        <StatCard label="Out of stock" value={out} icon={XCircle} accent="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Stock levels</h2>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr><th className="pb-2">Product</th><th className="pb-2">Stock</th><th className="pb-2 text-right">Adjust</th></tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5"><div className="font-medium">{p.name}</div><div className="text-xs text-muted">{p.sku}</div></td>
                    <td className="py-2.5">
                      <span className={`badge ${p.stock === 0 ? "bg-red-100 text-red-700" : p.stock <= p.lowStockLevel ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{p.stock}</span>
                    </td>
                    <td className="py-2.5 text-right"><StockAdjuster productId={p.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Recent movements</h2>
          <ul className="space-y-3">
            {movements.map((m) => (
              <li key={m.id} className="border-b border-black/5 pb-2.5 text-sm last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{m.product?.name ?? "—"}</span>
                  <span className={`font-semibold ${m.quantity >= 0 ? "text-green-600" : "text-red-600"}`}>{m.quantity >= 0 ? "+" : ""}{m.quantity}</span>
                </div>
                <div className="text-xs text-muted">{MOVEMENT_LABELS[m.type]} · {m.user?.name ?? "System"} · {formatDateTime(m.createdAt)}</div>
                {m.reason ? <div className="text-xs italic text-muted">{m.reason}</div> : null}
              </li>
            ))}
            {movements.length === 0 ? <p className="text-sm text-muted">No movements recorded.</p> : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
