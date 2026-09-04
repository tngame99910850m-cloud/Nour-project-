import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, canAccessBusinessDashboard } from "@/lib/auth";
import { toNumber } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await getSession();
  if (!session || !canAccessBusinessDashboard(session.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const header = [
    "Order Number", "Date", "Customer", "Phone", "Email", "Status", "Payment",
    "City", "Area", "Items", "Subtotal", "Delivery", "Discount", "Total",
  ];
  const rows = orders.map((o) => [
    o.orderNumber,
    o.createdAt.toISOString(),
    o.customerName,
    o.customerPhone,
    o.customerEmail ?? "",
    ORDER_STATUS_LABELS[o.status],
    o.paymentStatus,
    o.addressCity ?? "",
    o.addressArea ?? "",
    o.items.map((i) => `${i.productName} x${i.quantity}`).join("; "),
    toNumber(o.subtotal),
    toNumber(o.deliveryFee),
    toNumber(o.discount),
    toNumber(o.total),
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
