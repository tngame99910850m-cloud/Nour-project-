import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(999),
  variant: z.string().optional(),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(6, "Phone is required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  addressCity: z.string().optional().or(z.literal("")),
  addressArea: z.string().optional().or(z.literal("")),
  addressStreet: z.string().optional().or(z.literal("")),
  addressBuilding: z.string().optional().or(z.literal("")),
  addressNotes: z.string().optional().or(z.literal("")),
  deliveryDate: z.string().optional().or(z.literal("")),
  deliveryTime: z.string().optional().or(z.literal("")),
  orderNotes: z.string().optional().or(z.literal("")),
  deliveryZoneId: z.string().optional().or(z.literal("")),
  discountCode: z.string().optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
        variant: z.string().optional(),
      }),
    )
    .min(1, "Cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  sku: z.string().min(1),
  description: z.string().default(""),
  shortDesc: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).optional().nullable(),
  cost: z.coerce.number().min(0).optional().nullable(),
  images: z.array(z.string()).default([]),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockLevel: z.coerce.number().int().min(0).default(5),
  categoryId: z.string().min(1),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().optional().or(z.literal("")),
  metaDescription: z.string().optional().or(z.literal("")),
});
