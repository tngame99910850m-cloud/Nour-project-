"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export async function saveDiscount(formData: FormData) {
  const session = await requireBusinessAccess();
  const id = String(formData.get("id") || "");
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const data = {
    code,
    type: String(formData.get("type") || "PERCENTAGE") as any,
    value: Number(formData.get("value") || 0),
    minOrder: formData.get("minOrder") ? Number(formData.get("minOrder")) : null,
    maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : null,
    expiresAt: formData.get("expiresAt") ? new Date(String(formData.get("expiresAt"))) : null,
    isActive: formData.get("isActive") === "on",
  };
  if (id) {
    await prisma.discount.update({ where: { id }, data });
    await logAudit(session, { action: "discount.update", summary: `Updated discount ${code}` });
  } else {
    await prisma.discount.create({ data });
    await logAudit(session, { action: "discount.create", summary: `Created discount ${code}` });
  }
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(id: string) {
  const session = await requireBusinessAccess();
  await prisma.discount.delete({ where: { id } });
  await logAudit(session, { action: "discount.delete", summary: "Deleted a discount code" });
  revalidatePath("/admin/discounts");
}
