"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { productSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

function parseForm(formData: FormData) {
  const images = String(formData.get("images") || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const salePriceRaw = formData.get("salePrice");
  const costRaw = formData.get("cost");

  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || slugify(String(formData.get("name") || "")),
    sku: formData.get("sku"),
    description: formData.get("description") || "",
    shortDesc: formData.get("shortDesc") || "",
    price: formData.get("price"),
    salePrice: salePriceRaw ? Number(salePriceRaw) : null,
    cost: costRaw ? Number(costRaw) : null,
    images,
    stock: formData.get("stock"),
    lowStockLevel: formData.get("lowStockLevel"),
    categoryId: formData.get("categoryId"),
    isAvailable: formData.get("isAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    isNew: formData.get("isNew") === "on",
    tags,
    metaTitle: formData.get("metaTitle") || "",
    metaDescription: formData.get("metaDescription") || "",
  });
}

export async function createProduct(formData: FormData) {
  const session = await requireBusinessAccess();
  const parsed = parseForm(formData);
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  const d = parsed.data;

  const product = await prisma.product.create({
    data: {
      name: d.name,
      slug: d.slug,
      sku: d.sku,
      description: d.description,
      shortDesc: d.shortDesc || null,
      price: d.price,
      salePrice: d.salePrice ?? null,
      cost: d.cost ?? null,
      images: d.images,
      stock: d.stock,
      lowStockLevel: d.lowStockLevel,
      categoryId: d.categoryId,
      isAvailable: d.isAvailable,
      isFeatured: d.isFeatured,
      isBestSeller: d.isBestSeller,
      isNew: d.isNew,
      tags: d.tags,
      metaTitle: d.metaTitle || null,
      metaDescription: d.metaDescription || null,
    },
  });

  if (d.stock > 0) {
    await prisma.inventoryMovement.create({
      data: { productId: product.id, quantity: d.stock, type: "RECEIVED", reason: "Initial stock", userId: session.userId },
    });
  }

  await logAudit(session, { action: "product.create", entity: "Product", entityId: product.id, summary: `Created product "${d.name}"` });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await requireBusinessAccess();
  const parsed = parseForm(formData);
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  const d = parsed.data;

  const before = await prisma.product.findUnique({ where: { id } });
  if (!before) throw new Error("Product not found");

  // Track stock change as an adjustment movement
  const stockDelta = d.stock - before.stock;

  await prisma.product.update({
    where: { id },
    data: {
      name: d.name,
      slug: d.slug,
      sku: d.sku,
      description: d.description,
      shortDesc: d.shortDesc || null,
      price: d.price,
      salePrice: d.salePrice ?? null,
      cost: d.cost ?? null,
      images: d.images,
      stock: d.stock,
      lowStockLevel: d.lowStockLevel,
      categoryId: d.categoryId,
      isAvailable: d.isAvailable,
      isFeatured: d.isFeatured,
      isBestSeller: d.isBestSeller,
      isNew: d.isNew,
      tags: d.tags,
      metaTitle: d.metaTitle || null,
      metaDescription: d.metaDescription || null,
    },
  });

  if (stockDelta !== 0) {
    await prisma.inventoryMovement.create({
      data: { productId: id, quantity: stockDelta, type: "CORRECTION", reason: "Edited via product form", userId: session.userId },
    });
  }

  await logAudit(session, {
    action: "product.update",
    entity: "Product",
    entityId: id,
    summary: `Updated product "${d.name}"`,
    before: { price: before.price, stock: before.stock },
    after: { price: d.price, stock: d.stock },
  });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const session = await requireBusinessAccess();
  const p = await prisma.product.findUnique({ where: { id }, select: { name: true } });
  await prisma.product.delete({ where: { id } });
  await logAudit(session, { action: "product.delete", entity: "Product", entityId: id, summary: `Deleted product "${p?.name}"` });
  revalidatePath("/admin/products");
}

export async function adjustStock(productId: string, quantity: number, type: string, reason: string) {
  const session = await requireBusinessAccess();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  await prisma.$transaction([
    prisma.product.update({ where: { id: productId }, data: { stock: { increment: quantity } } }),
    prisma.inventoryMovement.create({
      data: { productId, quantity, type: type as any, reason, userId: session.userId },
    }),
  ]);

  await logAudit(session, {
    action: "inventory.adjust",
    entity: "Product",
    entityId: productId,
    summary: `Stock ${quantity > 0 ? "+" : ""}${quantity} for "${product.name}" (${type})`,
  });
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}
