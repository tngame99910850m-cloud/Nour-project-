import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { toNumber, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orders";
import { PageHeader } from "@/components/dashboard/ui";
import { OrdersToolbar } from "@/components/dashboard/orders-toolbar";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const business = await getBusinessSettings();
  const cur = business.currencySymbol;

  const where: Prisma.OrderWhereInput = {};
  if (sp.q) {
    where.OR = [
      { orderNumber: { contains: sp.q, mode: "insensitive" } },
      { customerName: { contains: sp.q, mode: "insensitive" } },
      { customerPhone: { contains: sp.q } },
    ];
  }
  if (sp.status && sp.status !== "ALL") where.status = sp.status as any;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${orders.length} orders`}
        action={
          <a href="/api/orders/export" className="btn-outline btn-md">Export CSV</a>
        }
      />

      <OrdersToolbar current={sp} />

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 bg-surface">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-canvas/50">
                  <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>{o.customerName}</div>
                    <div className="text-xs text-muted">{o.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-muted">{o._count.items}</td>
                  <td className="px-4 py-3 font-semibold">{money(toNumber(o.total), cur)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${ORDER_STATUS_COLORS[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-brand hover:underline">View</Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted">No orders found.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
