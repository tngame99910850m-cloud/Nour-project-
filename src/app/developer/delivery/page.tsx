import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { toNumber } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/ui";
import { DeliveryManager } from "@/components/dashboard/delivery-manager";

export const dynamic = "force-dynamic";

export default async function DeliveryConfigPage() {
  const [zones, partners, business] = await Promise.all([
    prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.deliveryPartner.findMany({ orderBy: { companyName: "asc" } }),
    getBusinessSettings(),
  ]);

  return (
    <div>
      <PageHeader title="Delivery Configuration" description="Zones, fees and partners. Shared with the business Delivery page." />
      <DeliveryManager
        currencySymbol={business.currencySymbol}
        zones={zones.map((z) => ({ id: z.id, name: z.name, fee: toNumber(z.fee), freeThreshold: z.freeThreshold ? toNumber(z.freeThreshold) : null, estimatedTime: z.estimatedTime, isActive: z.isActive }))}
        partners={partners.map((p) => ({ id: p.id, companyName: p.companyName, contactPerson: p.contactPerson, phone: p.phone, email: p.email, whatsapp: p.whatsapp, pricing: p.pricing, serviceAreas: p.serviceAreas, notes: p.notes, isActive: p.isActive }))}
      />
    </div>
  );
}
