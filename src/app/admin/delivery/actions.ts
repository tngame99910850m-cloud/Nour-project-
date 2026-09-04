"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

// ---- Zones ----
export async function saveZone(formData: FormData) {
  const session = await requireBusinessAccess();
  const id = String(formData.get("id") || "");
  const data = {
    name: String(formData.get("name") || ""),
    fee: Number(formData.get("fee") || 0),
    freeThreshold: formData.get("freeThreshold") ? Number(formData.get("freeThreshold")) : null,
    estimatedTime: String(formData.get("estimatedTime") || "") || null,
    isActive: formData.get("isActive") === "on",
  };
  if (id) {
    await prisma.deliveryZone.update({ where: { id }, data });
    await logAudit(session, { action: "delivery.zone.update", summary: `Updated delivery zone "${data.name}"` });
  } else {
    await prisma.deliveryZone.create({ data });
    await logAudit(session, { action: "delivery.zone.create", summary: `Created delivery zone "${data.name}"` });
  }
  revalidatePath("/admin/delivery");
}

export async function deleteZone(id: string) {
  const session = await requireBusinessAccess();
  await prisma.deliveryZone.delete({ where: { id } });
  await logAudit(session, { action: "delivery.zone.delete", summary: "Deleted a delivery zone" });
  revalidatePath("/admin/delivery");
}

// ---- Partners ----
export async function savePartner(formData: FormData) {
  const session = await requireBusinessAccess();
  const id = String(formData.get("id") || "");
  const data = {
    companyName: String(formData.get("companyName") || ""),
    contactPerson: String(formData.get("contactPerson") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    email: String(formData.get("email") || "") || null,
    whatsapp: String(formData.get("whatsapp") || "") || null,
    pricing: String(formData.get("pricing") || "") || null,
    serviceAreas: String(formData.get("serviceAreas") || "") || null,
    notes: String(formData.get("notes") || "") || null,
    isActive: formData.get("isActive") === "on",
  };
  if (id) {
    await prisma.deliveryPartner.update({ where: { id }, data });
    await logAudit(session, { action: "delivery.partner.update", summary: `Updated delivery partner "${data.companyName}"` });
  } else {
    await prisma.deliveryPartner.create({ data });
    await logAudit(session, { action: "delivery.partner.create", summary: `Added delivery partner "${data.companyName}"` });
  }
  revalidatePath("/admin/delivery");
}

export async function deletePartner(id: string) {
  const session = await requireBusinessAccess();
  await prisma.deliveryPartner.delete({ where: { id } });
  await logAudit(session, { action: "delivery.partner.delete", summary: "Deleted a delivery partner" });
  revalidatePath("/admin/delivery");
}
