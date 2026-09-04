import { getSystemSettings } from "@/lib/settings";
import { updateFeatures } from "../actions";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { SaveBar } from "@/components/dashboard/save-bar";

export const dynamic = "force-dynamic";

const FLAGS: { key: string; label: string; desc: string; danger?: boolean }[] = [
  { key: "storefrontEnabled", label: "Storefront enabled", desc: "Show the public store." },
  { key: "onlineOrdering", label: "Online ordering", desc: "Allow cart & checkout. Turn off to run WhatsApp-only." },
  { key: "whatsappOrdering", label: "WhatsApp ordering", desc: "Show WhatsApp buttons across the site." },
  { key: "reviews", label: "Testimonials section", desc: "Display customer testimonials on the homepage." },
  { key: "discountCodes", label: "Discount codes", desc: "Allow discount codes at checkout." },
  { key: "maintenanceMode", label: "Maintenance mode", desc: "Hide the store and show a maintenance screen.", danger: true },
];

export default async function FeaturesPage() {
  const system = await getSystemSettings();
  const f = system.features as Record<string, boolean>;

  return (
    <div>
      <PageHeader title="Feature Flags" description="Turn platform features on or off without deploying." />
      <form action={updateFeatures} className="space-y-6">
        <Card>
          <div className="divide-y divide-black/5">
            {FLAGS.map((flag) => (
              <label key={flag.key} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className={`font-medium ${flag.danger ? "text-red-600" : ""}`}>{flag.label}</p>
                  <p className="text-sm text-muted">{flag.desc}</p>
                </div>
                <input type="checkbox" name={flag.key} defaultChecked={f[flag.key]} className="h-6 w-6 flex-shrink-0 accent-brand" />
              </label>
            ))}
          </div>
        </Card>
        <SaveBar label="Save feature flags" />
      </form>
    </div>
  );
}
