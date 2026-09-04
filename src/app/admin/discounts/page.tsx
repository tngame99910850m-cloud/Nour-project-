import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { toNumber } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/ui";
import { DiscountManager } from "@/components/dashboard/discount-manager";

export const dynamic = "force-dynamic";

export default async function DiscountsPage() {
  const [discounts, business] = await Promise.all([
    prisma.discount.findMany({ orderBy: { createdAt: "desc" } }),
    getBusinessSettings(),
  ]);

  return (
    <div>
      <PageHeader title="Discount Codes" description="Create and manage promotional codes." />
      <DiscountManager
        currencySymbol={business.currencySymbol}
        discounts={discounts.map((d) => ({
          id: d.id, code: d.code, type: d.type, value: toNumber(d.value),
          minOrder: d.minOrder ? toNumber(d.minOrder) : null, maxUses: d.maxUses,
          usedCount: d.usedCount, expiresAt: d.expiresAt ? d.expiresAt.toISOString().slice(0, 10) : null,
          isActive: d.isActive,
        }))}
      />
    </div>
  );
}
