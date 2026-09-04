import { getBusinessSettings } from "@/lib/settings";
import { PageHeader } from "@/components/dashboard/ui";
import { BusinessSettingsForm } from "@/components/dashboard/business-settings-form";

export const dynamic = "force-dynamic";

export default async function BusinessSettingsPage() {
  const business = await getBusinessSettings();
  return (
    <div>
      <PageHeader title="Business Settings" description="Update your business information — changes reflect across the storefront instantly." />
      <BusinessSettingsForm initial={business} />
    </div>
  );
}
