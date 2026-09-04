import Link from "next/link";
import { CheckCircle2, XCircle, Database, Package, ShoppingCart, Users, AlertTriangle, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSystemSettings } from "@/lib/settings";
import { getEnvChecks } from "@/lib/env-status";
import { PageHeader, Card, StatCard } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function DeveloperOverview() {
  const system = await getSystemSettings();
  const envChecks = getEnvChecks();

  let dbOk = true;
  let counts = { products: 0, orders: 0, customers: 0, users: 0 };
  try {
    const [products, orders, customers, users] = await Promise.all([
      prisma.product.count(), prisma.order.count(), prisma.customer.count(), prisma.user.count(),
    ]);
    counts = { products, orders, customers, users };
  } catch {
    dbOk = false;
  }

  const requiredMissing = envChecks.filter((c) => c.required && !c.present);
  const activeFeatures = Object.entries(system.features).filter(([, v]) => v).length;

  return (
    <div>
      <PageHeader title="System Overview" description="Technical health and configuration of your platform." />

      {requiredMissing.length > 0 ? (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Missing required environment variables</p>
            <p>{requiredMissing.map((c) => c.key).join(", ")} — set these in your hosting provider before going live.</p>
          </div>
        </div>
      ) : null}

      {system.features.maintenanceMode ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ Maintenance mode is ON — the public storefront is hidden. Turn it off in Feature Flags.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={counts.products} icon={Package} accent="brand" />
        <StatCard label="Orders" value={counts.orders} icon={ShoppingCart} accent="green" />
        <StatCard label="Customers" value={counts.customers} icon={Users} accent="blue" />
        <StatCard label="System users" value={counts.users} icon={Users} accent="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-semibold"><Database className="h-4 w-4 text-emerald-500" /> Environment status</h2>
          <ul className="space-y-2.5">
            {envChecks.map((c) => (
              <li key={c.key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {c.present ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : c.required ? <XCircle className="h-4 w-4 text-red-500" /> : <XCircle className="h-4 w-4 text-gray-300" />}
                  <span className="font-mono text-xs">{c.key}</span>
                  {c.required ? <span className="badge bg-brand/10 text-brand">required</span> : null}
                </span>
                <span className="text-xs text-muted">{c.present ? "Set" : "Not set"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Values are never displayed — only whether each variable is present.</p>
        </Card>

        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-emerald-500" /> Runtime</h2>
          <ul className="space-y-2.5 text-sm">
            <Row label="Database connection" value={dbOk ? "Connected" : "Error"} ok={dbOk} />
            <Row label="Environment" value={process.env.NODE_ENV || "unknown"} ok />
            <Row label="Node version" value={process.version} ok />
            <Row label="Active feature flags" value={`${activeFeatures} enabled`} ok />
            <Row label="Storefront" value={system.features.storefrontEnabled && !system.features.maintenanceMode ? "Live" : "Offline"} ok={system.features.storefrontEnabled && !system.features.maintenanceMode} />
            <Row label="Payment provider" value={system.integrations.paymentProvider} ok />
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/developer/features" className="btn-outline btn-sm">Feature Flags</Link>
            <Link href="/developer/system" className="btn-outline btn-sm">Deployment</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-medium ${ok ? "text-ink" : "text-red-500"}`}>{value}</span>
    </li>
  );
}
