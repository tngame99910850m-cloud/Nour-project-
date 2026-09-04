import { prisma } from "./prisma";

/** Generate a sequential, human-friendly order number like ORD-2026-00001. */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;
  const last = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  let next = 1;
  if (last) {
    const n = parseInt(last.orderNumber.replace(prefix, ""), 10);
    if (!Number.isNaN(n)) next = n + 1;
  }
  return `${prefix}${String(next).padStart(5, "0")}`;
}

export const ORDER_STATUS_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "ASSIGNED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready for Delivery",
  ASSIGNED: "Assigned to Driver",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-indigo-100 text-indigo-800",
  READY: "bg-purple-100 text-purple-800",
  ASSIGNED: "bg-cyan-100 text-cyan-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};
