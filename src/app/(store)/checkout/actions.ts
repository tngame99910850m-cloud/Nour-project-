"use server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators";
import { generateOrderNumber } from "@/lib/orders";
import { effectivePrice } from "@/lib/format";
import { toNumber } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export interface CheckoutResult {
  ok: boolean;
  orderNumber?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function placeOrder(raw: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { ok: false, error: "Please check the form.", fieldErrors };
  }
  const data = parsed.data;

  // Load products authoritatively — never trust client prices.
  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  if (products.length === 0) return { ok: false, error: "No valid products in cart." };

  let subtotal = 0;
  const orderItems: {
    productId: string;
    productName: string;
    variantInfo?: string;
    price: number;
    quantity: number;
    lineTotal: number;
  }[] = [];

  for (const item of data.items) {
    const p = productMap.get(item.productId);
    if (!p || !p.isAvailable) continue;
    const unit = effectivePrice(p.price, p.salePrice);
    const qty = Math.max(1, Math.min(item.quantity, Math.max(p.stock, 1)));
    const line = unit * qty;
    subtotal += line;
    orderItems.push({
      productId: p.id,
      productName: p.name,
      variantInfo: item.variant,
      price: unit,
      quantity: qty,
      lineTotal: line,
    });
  }

  if (orderItems.length === 0) return { ok: false, error: "Cart items are no longer available." };

  // Delivery fee
  let deliveryFee = 0;
  let zoneId: string | null = null;
  if (data.deliveryZoneId) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id: data.deliveryZoneId } });
    if (zone && zone.isActive) {
      zoneId = zone.id;
      const threshold = zone.freeThreshold ? toNumber(zone.freeThreshold) : null;
      deliveryFee = threshold != null && subtotal >= threshold ? 0 : toNumber(zone.fee);
    }
  }

  // Discount
  let discount = 0;
  let discountCode: string | null = null;
  if (data.discountCode) {
    const code = data.discountCode.trim().toUpperCase();
    const d = await prisma.discount.findUnique({ where: { code } });
    if (
      d &&
      d.isActive &&
      (!d.expiresAt || d.expiresAt > new Date()) &&
      (!d.maxUses || d.usedCount < d.maxUses) &&
      (!d.minOrder || subtotal >= toNumber(d.minOrder))
    ) {
      discount = d.type === "PERCENTAGE" ? (subtotal * toNumber(d.value)) / 100 : toNumber(d.value);
      discount = Math.min(discount, subtotal);
      discountCode = code;
    } else {
      return { ok: false, error: "Invalid or expired discount code.", fieldErrors: { discountCode: "Invalid code" } };
    }
  }

  const total = Math.max(0, subtotal + deliveryFee - discount);
  const orderNumber = await generateOrderNumber();

  try {
    await prisma.$transaction(async (tx) => {
      // Upsert customer by phone
      const customer = await tx.customer.upsert({
        where: { phone: data.customerPhone },
        create: {
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail || null,
          city: data.addressCity || null,
          address: [data.addressBuilding, data.addressStreet, data.addressArea].filter(Boolean).join(", ") || null,
        },
        update: {
          name: data.customerName,
          email: data.customerEmail || undefined,
          city: data.addressCity || undefined,
        },
      });

      await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          addressCity: data.addressCity || null,
          addressArea: data.addressArea || null,
          addressStreet: data.addressStreet || null,
          addressBuilding: data.addressBuilding || null,
          addressNotes: data.addressNotes || null,
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
          deliveryTime: data.deliveryTime || null,
          deliveryZoneId: zoneId,
          subtotal,
          deliveryFee,
          discount,
          total,
          discountCode,
          orderNotes: data.orderNotes || null,
          items: { create: orderItems },
        },
      });

      // Decrement stock and record inventory movements
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            quantity: -item.quantity,
            type: "SALE",
            reason: `Order ${orderNumber}`,
          },
        });
      }

      if (discountCode) {
        await tx.discount.update({ where: { code: discountCode }, data: { usedCount: { increment: 1 } } });
      }
    });

    trackEvent("order_placed", { metadata: { orderNumber, total } });
    return { ok: true, orderNumber };
  } catch (err) {
    console.error("Order creation failed:", err);
    return { ok: false, error: "Something went wrong placing your order. Please try again." };
  }
}

export async function validateDiscount(code: string, subtotal: number): Promise<{ ok: boolean; amount?: number; message: string }> {
  if (!code) return { ok: false, message: "Enter a code" };
  const d = await prisma.discount.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!d || !d.isActive) return { ok: false, message: "Invalid code" };
  if (d.expiresAt && d.expiresAt < new Date()) return { ok: false, message: "Code expired" };
  if (d.maxUses && d.usedCount >= d.maxUses) return { ok: false, message: "Code no longer available" };
  if (d.minOrder && subtotal < toNumber(d.minOrder)) return { ok: false, message: `Minimum order ${toNumber(d.minOrder)}` };
  const amount = d.type === "PERCENTAGE" ? (subtotal * toNumber(d.value)) / 100 : toNumber(d.value);
  return { ok: true, amount: Math.min(amount, subtotal), message: "Discount applied" };
}
