"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export async function saveCustomerNote(customerId: string, note: string) {
  const session = await requireBusinessAccess();
  await prisma.customer.update({ where: { id: customerId }, data: { notes: note } });
  await logAudit(session, { action: "customer.note", entity: "Customer", entityId: customerId, summary: "Updated customer note" });
  revalidatePath(`/admin/customers/${customerId}`);
}
