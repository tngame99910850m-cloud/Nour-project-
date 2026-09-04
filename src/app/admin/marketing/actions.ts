"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export async function saveBanner(formData: FormData) {
  const session = await requireBusinessAccess();
  const id = String(formData.get("id") || "");
  const data = {
    title: String(formData.get("title") || ""),
    subtitle: String(formData.get("subtitle") || "") || null,
    image: String(formData.get("image") || "") || null,
    ctaText: String(formData.get("ctaText") || "") || null,
    ctaLink: String(formData.get("ctaLink") || "") || null,
    isActive: formData.get("isActive") === "on",
    sortOrder: Number(formData.get("sortOrder") || 0),
  };
  if (id) await prisma.banner.update({ where: { id }, data });
  else await prisma.banner.create({ data });
  await logAudit(session, { action: "marketing.banner", summary: `Saved banner "${data.title}"` });
  revalidatePath("/admin/marketing");
}

export async function deleteBanner(id: string) {
  const session = await requireBusinessAccess();
  await prisma.banner.delete({ where: { id } });
  await logAudit(session, { action: "marketing.banner.delete", summary: "Deleted a banner" });
  revalidatePath("/admin/marketing");
}

export async function saveTestimonial(formData: FormData) {
  const session = await requireBusinessAccess();
  const id = String(formData.get("id") || "");
  const data = {
    name: String(formData.get("name") || ""),
    text: String(formData.get("text") || ""),
    rating: Number(formData.get("rating") || 5),
    isActive: formData.get("isActive") === "on",
    sortOrder: Number(formData.get("sortOrder") || 0),
  };
  if (id) await prisma.testimonial.update({ where: { id }, data });
  else await prisma.testimonial.create({ data });
  await logAudit(session, { action: "marketing.testimonial", summary: `Saved testimonial from "${data.name}"` });
  revalidatePath("/admin/marketing");
}

export async function deleteTestimonial(id: string) {
  const session = await requireBusinessAccess();
  await prisma.testimonial.delete({ where: { id } });
  await logAudit(session, { action: "marketing.testimonial.delete", summary: "Deleted a testimonial" });
  revalidatePath("/admin/marketing");
}
