import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { getDashboardStats, getRevenueByCategory, getBestSellingProducts, resolveRange, type DateRangeKey } from "@/lib/reports";
import { money } from "@/lib/format";
import { toNumber } from "@/lib/utils";
import { PageHeader, Card, StatCard } from "@/components/dashboard/ui";
import { SalesAreaChart, CategoryPieChart, BestSellersBar } from "@/components/dashboard/charts";

export const dynamic = "force-dynamic";

const RANGES: { key: DateRangeKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "month", label: "This month" },
  { key: "lastmonth", label: "Last month" },
  { key: "all", label: "All time" },
];

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const sp = await searchParams;
  const rangeKey = (RANGES.find((r) => r.key === sp.range)?.key || "30d") as DateRangeKey;
  const range = resolveRange(rangeKey);
  const business = await getBusinessSettings();
  const cur = business.currencySymbol;

  const [stats, byCategory, bestSellers, deliveryStats, mostViewed] = await Promise.all([
    getDashboardStats(range),
    getRevenueByCategory(range),
    getBestSellingProducts(range, 8),
    prisma.order.groupBy({ by: ["status"], _count: true, where: { createdAt: { gte: range.from, lte: range.to } } }),
    prisma.product.findMany({ orderBy: { views: "desc" }, take: 8, select: { name: true, views: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Reports" description="Deep-dive into your sales and performance." />

      <div className="mb-6 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Link key={r.key} href={`/admin/reports?range=${r.key}`} className={`rounded-full px-4 py-1.5 text-sm font-medium ${rangeKey === r.key ? "bg-brand text-white" : "bg-white hover:bg-black/5"}`}>{r.label}</Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={money(stats.revenue, cur)} accent="green" />
        <StatCard label="Orders" value={stats.orderCount} accent="brand" />
        <StatCard label="Avg order value" value={money(stats.avgOrder, cur)} accent="amber" />
        <StatCard label="Products" value={stats.productCount} accent="blue" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2"><h3 className="mb-4 font-semibold">Sales trend</h3><SalesAreaChart data={stats.salesSeries} /></Card>
        <Card><h3 className="mb-4 font-semibold">Revenue by category</h3><CategoryPieChart data={byCategory} /></Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><h3 className="mb-4 font-semibold">Best sellers (units)</h3><BestSellersBar data={bestSellers} /></Card>
        <Card>
          <h3 className="mb-4 font-semibold">Delivery performance</h3>
          <ul className="space-y-2">
            {deliveryStats.map((d) => (
              <li key={d.status} className="flex items-center justify-between text-sm">
                <span>{d.status}</span>
                <span className="font-medium">{d._count}</span>
              </li>
            ))}
            {deliveryStats.length === 0 ? <p className="text-sm text-muted">No orders in this period.</p> : null}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Best-selling products (revenue)</h3>
          <ul className="divide-y divide-black/5">
            {bestSellers.map((b) => (
              <li key={b.name} className="flex items-center justify-between py-2 text-sm">
                <span>{b.name}</span>
                <span className="font-medium">{money(b.revenue, cur)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">Most viewed products</h3>
          <ul className="divide-y divide-black/5">
            {mostViewed.map((p) => (
              <li key={p.name} className="flex items-center justify-between py-2 text-sm">
                <span>{p.name}</span>
                <span className="text-muted">{p.views} views</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
