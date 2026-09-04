import { prisma } from "@/lib/prisma";
import { getBusinessSettings, getSystemSettings } from "@/lib/settings";
import { toNumber } from "@/lib/utils";
import { CheckoutForm } from "@/components/store/checkout-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [business, system, zones] = await Promise.all([
    getBusinessSettings(),
    getSystemSettings(),
    prisma.deliveryZone.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!system.features.onlineOrdering) redirect("/products");

  return (
    <div className="container-px py-10">
      <h1 className="section-title mb-8">Checkout</h1>
      <CheckoutForm
        currencySymbol={business.currencySymbol}
        discountEnabled={system.features.discountCodes}
        zones={zones.map((z) => ({
          id: z.id,
          name: z.name,
          fee: toNumber(z.fee),
          freeThreshold: z.freeThreshold ? toNumber(z.freeThreshold) : null,
          estimatedTime: z.estimatedTime,
        }))}
      />
    </div>
  );
}
