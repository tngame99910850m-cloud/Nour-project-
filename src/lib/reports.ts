import { prisma } from "./prisma";
import { toNumber } from "./utils";

export type DateRangeKey =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "month"
  | "lastmonth"
  | "all";

export function resolveRange(key: DateRangeKey, custom?: { from?: string; to?: string }) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let from: Date;
  let to: Date = now;

  switch (key) {
    case "today":
      from = startOfToday;
      break;
    case "yesterday":
      from = new Date(startOfToday);
      from.setDate(from.getDate() - 1);
      to = startOfToday;
      break;
    case "7d":
      from = new Date(startOfToday);
      from.setDate(from.getDate() - 6);
      break;
    case "30d":
      from = new Date(startOfToday);
      from.setDate(from.getDate() - 29);
      break;
    case "month":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "lastmonth":
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "all":
    default:
      from = new Date(2000, 0, 1);
      break;
  }

  if (custom?.from) from = new Date(custom.from);
  if (custom?.to) to = new Date(custom.to);

  return { from, to };
}

const COMPLETED_STATUSES = ["CONFIRMED", "PREPARING", "READY", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED"];

export async function getDashboardStats(range: { from: Date; to: Date }) {
  const dateFilter = { gte: range.from, lte: range.to };

  const [allOrders, todayOrders, weekOrders, monthOrders, statusCounts, lowStock, productCount, customerCount] =
    await Promise.all([
      prisma.order.findMany({
        where: { createdAt: dateFilter },
        select: { total: true, status: true, createdAt: true },
      }),
      sumSales("today"),
      sumSales("7d"),
      sumSales("month"),
      prisma.order.groupBy({ by: ["status"], _count: true }),
      prisma.product.findMany({
        where: { stock: { lte: prisma.product.fields.lowStockLevel } },
        select: { id: true, name: true, stock: true, lowStockLevel: true, sku: true },
        take: 10,
      }),
      prisma.product.count(),
      prisma.customer.count(),
    ]);

  const revenue = allOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + toNumber(o.total), 0);
  const orderCount = allOrders.length;
  const paidCount = allOrders.filter((o) => o.status !== "CANCELLED").length;
  const avgOrder = paidCount > 0 ? revenue / paidCount : 0;

  const statusMap: Record<string, number> = {};
  for (const s of statusCounts) statusMap[s.status] = s._count;

  // Sales over time (group by day)
  const seriesMap = new Map<string, { sales: number; orders: number }>();
  for (const o of allOrders) {
    if (o.status === "CANCELLED") continue;
    const key = o.createdAt.toISOString().slice(0, 10);
    const cur = seriesMap.get(key) || { sales: 0, orders: 0 };
    cur.sales += toNumber(o.total);
    cur.orders += 1;
    seriesMap.set(key, cur);
  }
  const salesSeries = [...seriesMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date: date.slice(5), sales: Math.round(v.sales), orders: v.orders }));

  return {
    revenue,
    orderCount,
    avgOrder,
    todaySales: todayOrders,
    weekSales: weekOrders,
    monthSales: monthOrders,
    pending: statusMap["PENDING"] || 0,
    completed: statusMap["DELIVERED"] || 0,
    cancelled: statusMap["CANCELLED"] || 0,
    lowStock,
    productCount,
    customerCount,
    salesSeries,
  };
}

async function sumSales(key: DateRangeKey) {
  const { from, to } = resolveRange(key);
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to }, status: { not: "CANCELLED" } },
    select: { total: true },
  });
  return orders.reduce((s, o) => s + toNumber(o.total), 0);
}

export async function getRevenueByCategory(range: { from: Date; to: Date }) {
  const items = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: range.from, lte: range.to }, status: { not: "CANCELLED" } } },
    include: { product: { include: { category: true } } },
  });
  const map = new Map<string, number>();
  for (const it of items) {
    const cat = it.product?.category?.name || "Other";
    map.set(cat, (map.get(cat) || 0) + toNumber(it.lineTotal));
  }
  return [...map.entries()].map(([name, value]) => ({ name, value: Math.round(value) }));
}

export async function getBestSellingProducts(range: { from: Date; to: Date }, limit = 5) {
  const items = await prisma.orderItem.groupBy({
    by: ["productName"],
    where: { order: { createdAt: { gte: range.from, lte: range.to }, status: { not: "CANCELLED" } } },
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
  return items.map((i) => ({
    name: i.productName,
    quantity: i._sum.quantity || 0,
    revenue: Math.round(toNumber(i._sum.lineTotal)),
  }));
}
