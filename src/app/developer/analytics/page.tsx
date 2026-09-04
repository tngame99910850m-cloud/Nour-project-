import { getSystemSettings } from "@/lib/settings";
import { updateAnalytics } from "../actions";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { SaveBar } from "@/components/dashboard/save-bar";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const system = await getSystemSettings();
  const a = system.analytics;
  return (
    <div>
      <PageHeader title="Analytics" description="Connect Google Analytics and Meta Pixel for traffic and conversion tracking." />
      <form action={updateAnalytics} className="space-y-6">
        <Card>
          <div className="grid gap-4">
            <div>
              <label className="label">Google Analytics Measurement ID</label>
              <input name="gaMeasurementId" defaultValue={a.gaMeasurementId} className="input font-mono" placeholder="G-XXXXXXXXXX" />
            </div>
            <div>
              <label className="label">Meta Pixel ID</label>
              <input name="metaPixelId" defaultValue={a.metaPixelId} className="input font-mono" placeholder="123456789012345" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">
            These can also be set via the <code>NEXT_PUBLIC_GA_MEASUREMENT_ID</code> and <code>NEXT_PUBLIC_META_PIXEL_ID</code> environment
            variables. Scripts load only when an ID is present.
          </p>
        </Card>

        <Card>
          <h3 className="font-semibold">Built-in event tracking</h3>
          <p className="mt-2 text-sm text-muted">The platform records these events to your database automatically:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["page_view", "product_view", "add_to_cart", "checkout_started", "order_placed"].map((e) => (
              <span key={e} className="badge bg-emerald-50 font-mono text-emerald-700">{e}</span>
            ))}
          </div>
        </Card>

        <SaveBar />
      </form>
    </div>
  );
}
