import { getSystemSettings } from "@/lib/settings";
import { getEnvChecks } from "@/lib/env-status";
import { updateIntegrations } from "../actions";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { SaveBar } from "@/components/dashboard/save-bar";
import { CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const system = await getSystemSettings();
  const env = getEnvChecks();
  const emailReady = env.find((e) => e.key === "SMTP_HOST")?.present;
  const stripeReady = env.find((e) => e.key === "STRIPE_SECRET_KEY")?.present;

  return (
    <div>
      <PageHeader title="Integrations" description="Configure email and payment providers. Secrets stay in environment variables." />
      <form action={updateIntegrations} className="space-y-6">
        <Card>
          <h3 className="mb-3 font-semibold">Email</h3>
          <div className="flex items-center gap-2 text-sm">
            {emailReady ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-300" />}
            <span className="text-muted">SMTP credentials {emailReady ? "detected" : "not set"} (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)</span>
          </div>
          <label className="label mt-4">Email provider</label>
          <select name="emailProvider" defaultValue={system.integrations.emailProvider} className="input sm:w-64">
            <option value="none">None (manual follow-up)</option>
            <option value="smtp">SMTP</option>
          </select>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold">Payments</h3>
          <div className="flex items-center gap-2 text-sm">
            {stripeReady ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-300" />}
            <span className="text-muted">Stripe keys {stripeReady ? "detected" : "not set"} (STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)</span>
          </div>
          <label className="label mt-4">Payment provider</label>
          <select name="paymentProvider" defaultValue={system.integrations.paymentProvider} className="input sm:w-64">
            <option value="manual">Cash / Pay on delivery</option>
            <option value="stripe">Stripe (requires keys)</option>
            <option value="none">Disabled</option>
          </select>
          <p className="mt-3 text-xs text-muted">The current checkout uses pay-on-delivery. Stripe scaffolding is prepared — add keys and enable to extend.</p>
        </Card>

        <SaveBar />
      </form>
    </div>
  );
}
