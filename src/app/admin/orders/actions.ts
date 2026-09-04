"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import type { OrderStatus } from "@prisma/client";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await requireBusinessAccess();
  const before = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true, orderNumber: true } });
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  await logAudit(session, {
    action: "order.status",
    entity: "Order",
    entityId: orderId,
    summary: `Changed order ${before?.orderNumber} status to ${status}`,
    before: { status: before?.status },
    after: { status },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function assignDeliveryPartner(orderId: string, partnerId: string | null) {
  const session = await requireBusinessAccess();
  await prisma.order.update({ where: { id: orderId }, data: { deliveryPartnerId: partnerId } });
  await logAudit(session, {
    action: "order.assign",
    entity: "Order",
    entityId: orderId,
    summary: partnerId ? `Assigned delivery partner to order` : `Removed delivery partner from order`,
  });
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updatePaymentStatus(orderId: string, paymentStatus: "UNPAID" | "PAID" | "REFUNDED") {
  const session = await requireBusinessAccess();
  await prisma.order.update({ where: { id: orderId }, data: { paymentStatus } });
  await logAudit(session, { action: "order.payment", entity: "Order", entityId: orderId, summary: `Payment marked ${paymentStatus}` });
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function saveInternalNote(orderId: string, note: string) {
  const session = await requireBusinessAccess();
  await prisma.order.update({ where: { id: orderId }, data: { internalNotes: note } });
  await logAudit(session, { action: "order.note", entity: "Order", entityId: orderId, summary: "Updated internal note" });
  revalidatePath(`/admin/orders/${orderId}`);
}
