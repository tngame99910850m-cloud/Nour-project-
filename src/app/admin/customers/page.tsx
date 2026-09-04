import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { toNumber, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/ui";
import { TableSearch } from "@/components/dashboard/table-search";

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const business = await getBusinessSettings();
  const cur = business.currencySymbol;

  const where: Prisma.CustomerWhereInput = sp.q
    ? { OR: [{ name: { contains: sp.q, mode: "insensitive" } }, { phone: { contains: sp.q } }, { email: { contains: sp.q, mode: "insensitive" } }] }
    : {};

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { orders: { select: { total: true, createdAt: true, status: true } } },
  });

  const rows = customers.map((c) => {
    const valid = c.orders.filter((o) => o.status !== "CANCELLED");
    const spent = valid.reduce((s, o) => s + toNumber(o.total), 0);
    const last = c.orders[0]?.createdAt;
    return { ...c, orderCount: c.orders.length, spent, last };
  });

  return (
    <div>
      <PageHeader title="Customers" description={`${rows.length} customers`} />
      <TableSearch placeholder="Search by name, phone, email…" basePath="/admin/customers" initial={sp.q} />

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 bg-surface">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Total spent</th><th className="px-4 py-3">Last order</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-canvas/50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted"><div>{c.phone}</div>{c.email ? <div className="text-xs">{c.email}</div> : null}</td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3 font-semibold">{money(c.spent, cur)}</td>
                  <td className="px-4 py-3 text-muted">{c.last ? formatDate(c.last) : "—"}</td>
                  <td className="px-4 py-3 text-right"><Link href={`/admin/customers/${c.id}`} className="text-brand hover:underline">View</Link></td>
                </tr>
              ))}
              {rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-muted">No customers yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
