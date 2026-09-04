"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";

export async function createCategory(formData: FormData) {
  const session = await requireBusinessAccess();
  const name = String(formData.get("name") || "").trim();
  const group = String(formData.get("group") || "OTHER");
  const parentId = String(formData.get("parentId") || "") || null;
  const image = String(formData.get("image") || "") || null;
  if (!name) throw new Error("Name required");

  let slug = slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  await prisma.category.create({
    data: { name, slug, group: group as any, parentId, image },
  });
  await logAudit(session, { action: "category.create", entity: "Category", summary: `Created category "${name}"` });
  revalidatePath("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await requireBusinessAccess();
  const name = String(formData.get("name") || "").trim();
  const image = String(formData.get("image") || "") || null;
  const isActive = formData.get("isActive") === "on";
  await prisma.category.update({ where: { id }, data: { name, image, isActive } });
  await logAudit(session, { action: "category.update", entity: "Category", entityId: id, summary: `Updated category "${name}"` });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  const session = await requireBusinessAccess();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) throw new Error("Cannot delete a category that still has products.");
  const c = await prisma.category.findUnique({ where: { id }, select: { name: true } });
  await prisma.category.delete({ where: { id } });
  await logAudit(session, { action: "category.delete", entity: "Category", entityId: id, summary: `Deleted category "${c?.name}"` });
  revalidatePath("/admin/categories");
}
