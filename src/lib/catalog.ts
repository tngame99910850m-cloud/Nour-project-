import { prisma } from "./prisma";
import { toNumber } from "./utils";
import type { Prisma } from "@prisma/client";

export interface SerializedProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDesc: string | null;
  price: number;
  salePrice: number | null;
  images: string[];
  stock: number;
  lowStockLevel: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  tags: string[];
  views: number;
  metaTitle: string | null;
  metaDescription: string | null;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
}

type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;

export function serializeProduct(p: ProductWithCategory | any): SerializedProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    shortDesc: p.shortDesc,
    price: toNumber(p.price),
    salePrice: p.salePrice == null ? null : toNumber(p.salePrice),
    images: p.images ?? [],
    stock: p.stock,
    lowStockLevel: p.lowStockLevel,
    isAvailable: p.isAvailable,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNew: p.isNew,
    tags: p.tags ?? [],
    views: p.views,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    categoryId: p.categoryId,
    categoryName: p.category?.name,
    categorySlug: p.category?.slug,
  };
}

export async function getFeaturedProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, isAvailable: true },
    include: { category: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(serializeProduct);
}

export async function getBestSellers(limit = 8) {
  const products = await prisma.product.findMany({
    where: { isBestSeller: true, isAvailable: true },
    include: { category: true },
    take: limit,
  });
  return products.map(serializeProduct);
}

export async function getNewArrivals(limit = 8) {
  const products = await prisma.product.findMany({
    where: { isNew: true, isAvailable: true },
    include: { category: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(serializeProduct);
}

export async function getOnSale(limit = 8) {
  const products = await prisma.product.findMany({
    where: { isAvailable: true, salePrice: { not: null } },
    include: { category: true },
    take: limit,
  });
  return products.map(serializeProduct);
}

export async function getProductsByGroup(group: "WEDDING" | "HOME", limit = 8) {
  const products = await prisma.product.findMany({
    where: { isAvailable: true, category: { group } },
    include: { category: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(serializeProduct);
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, variants: true },
  });
  if (!product) return null;
  return {
    ...serializeProduct(product),
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      value: v.value,
      priceDiff: toNumber(v.priceDiff),
      stock: v.stock,
    })),
  };
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  const products = await prisma.product.findMany({
    where: { categoryId, id: { not: excludeId }, isAvailable: true },
    include: { category: true },
    take: limit,
  });
  return products.map(serializeProduct);
}
