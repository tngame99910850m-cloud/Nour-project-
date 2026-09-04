import Link from "next/link";
import {
  DollarSign, ShoppingCart, Clock, CheckCircle2, XCircle, TrendingUp, Users, Package, AlertTriangle,
} from "lucide-react";
import { getBusinessSettings } from "@/lib/settings";
import { getDashboardStats, getRevenueByCategory, getBestSellingProducts, resolveRange, type DateRangeKey } from "@/lib/reports";
import { money, moneyShort } from "@/lib/format";
import { StatCard, PageHeader, Card } from "@/components/dashboard/ui";
import { SalesAreaChart, OrdersBarChart, CategoryPieChart, BestSellersBar, ChartLegend } from "@/components/dashboard/charts";

export const dynamic = "force-dynamic";

const RANGES: { key: DateRangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "month", label: "This month" },
  { key: "lastmonth", label: "Last month" },
  { key: "all", label: "All time" },
];

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const rangeKey = (RANGES.find((r) => r.key === sp.range)?.key || "30d") as DateRangeKey;
  const range = resolveRange(rangeKey);
  const business = await getBusinessSettings();
  const cur = business.currencySymbol;

  const [stats, byCategory, bestSellers] = await Promise.all([
    getDashboardStats(range),
    getRevenueByCategory(range),
    getBestSellingProducts(range, 5),
  ]);

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your business performance." />

      {/* Range filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Link
            key={r.key}
            href={`/admin?range=${r.key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              rangeKey === r.key ? "bg-brand text-white" : "bg-white text-ink hover:bg-black/5"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Primary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sales" value={money(stats.revenue, cur)} icon={DollarSign} accent="green" sub={`${stats.orderCount} orders`} />
        <StatCard label="Today's Sales" value={money(stats.todaySales, cur)} icon={TrendingUp} accent="brand" />
        <StatCard label="This Week" value={money(stats.weekSales, cur)} icon={TrendingUp} accent="blue" />
        <StatCard label="Avg Order Value" value={money(stats.avgOrder, cur)} icon={ShoppingCart} accent="amber" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending Orders" value={stats.pending} icon={Clock} accent="amber" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} accent="green" />
        <StatCard label="Cancelled" value={stats.cancelled} icon={XCircle} accent="red" />
        <StatCard label="Customers" value={stats.customerCount} icon={Users} accent="blue" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-semibold">Sales over time</h3>
          <SalesAreaChart data={stats.salesSeries} />
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">Revenue by category</h3>
          <CategoryPieChart data={byCategory} />
          <ChartLegend items={byCategory.map((c) => ({ name: c.name, value: moneyShort(c.value, cur) }))} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Orders over time</h3>
          <OrdersBarChart data={stats.salesSeries} />
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">Best-selling products</h3>
          <BestSellersBar data={bestSellers} />
        </Card>
      </div>

      {/* Low stock */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-amber-500" /> Low stock alerts</h3>
            <Link href="/admin/inventory" className="text-sm text-brand hover:underline">Manage inventory</Link>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{p.name} <span className="text-muted">({p.sku})</span></span>
                  <span className={`badge ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold">Best sellers</h3>
          <ul className="space-y-2.5">
            {bestSellers.map((b, i) => (
              <li key={b.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">{i + 1}</span>
                  <span className="line-clamp-1">{b.name}</span>
                </span>
                <span className="text-muted">{b.quantity} sold</span>
              </li>
            ))}
            {bestSellers.length === 0 ? <p className="py-4 text-center text-sm text-muted">No sales yet</p> : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
