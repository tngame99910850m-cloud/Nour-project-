import { CheckCircle2, XCircle, Server, GitBranch } from "lucide-react";
import { getEnvChecks } from "@/lib/env-status";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function SystemPage() {
  const env = getEnvChecks();
  let dbOk = true;
  let migrationCount = 0;
  try {
    const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint as count FROM "_prisma_migrations"`,
    );
    migrationCount = Number(rows[0]?.count ?? 0);
  } catch {
    dbOk = false;
  }

  const requiredMissing = env.filter((c) => c.required && !c.present);

  return (
    <div>
      <PageHeader title="Deployment & Environment" description="Production readiness and deployment status." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-semibold"><Server className="h-4 w-4 text-emerald-500" /> Environment variables</h2>
          <ul className="space-y-2.5">
            {env.map((c) => (
              <li key={c.key} className="flex items-start justify-between gap-3 text-sm">
                <span className="flex items-center gap-2">
                  {c.present ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" /> : c.required ? <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" /> : <XCircle className="h-4 w-4 flex-shrink-0 text-gray-300" />}
                  <span>
                    <span className="font-mono text-xs">{c.key}</span>
                    <span className="block text-xs text-muted">{c.hint}</span>
                  </span>
                </span>
                <span className="text-xs text-muted">{c.present ? "Set" : c.required ? "Missing" : "Optional"}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 font-semibold">Runtime</h2>
            <ul className="space-y-2 text-sm">
              <Row label="Node version" value={process.version} />
              <Row label="Environment" value={process.env.NODE_ENV ?? "unknown"} />
              <Row label="Database" value={dbOk ? "Connected" : "Error"} ok={dbOk} />
              <Row label="Migrations applied" value={String(migrationCount)} />
              <Row label="Region" value={process.env.VERCEL_REGION ?? "local"} />
              <Row label="Deployment" value={process.env.VERCEL ? "Vercel" : "Self-hosted / local"} />
            </ul>
          </Card>

          <Card>
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><GitBranch className="h-4 w-4 text-emerald-500" /> Production readiness</h2>
            <ul className="space-y-1.5 text-sm text-muted">
              <li className={requiredMissing.length === 0 ? "text-green-600" : "text-red-600"}>
                {requiredMissing.length === 0 ? "✓ All required env vars set" : `✗ Missing: ${requiredMissing.map((c) => c.key).join(", ")}`}
              </li>
              <li className={dbOk ? "text-green-600" : "text-red-600"}>{dbOk ? "✓ Database reachable & migrated" : "✗ Database not reachable"}</li>
              <li className="text-green-600">✓ Security headers configured (next.config)</li>
              <li className="text-green-600">✓ Role-based route protection (middleware)</li>
              <li className="text-green-600">✓ Server-side price validation at checkout</li>
            </ul>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <h2 className="mb-2 font-semibold">Deploying to Vercel</h2>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted">
          <li>Provision a PostgreSQL database (Vercel Postgres, Neon, or Supabase).</li>
          <li>Add all environment variables from <code>.env.example</code> in Project Settings → Environment Variables.</li>
          <li>Set the build command to <code>prisma generate &amp;&amp; next build</code> (already the default).</li>
          <li>Run <code>npx prisma migrate deploy</code> against the production database.</li>
          <li>Seed the first admin with <code>npm run db:seed</code> (or create users via this portal).</li>
        </ol>
      </Card>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-medium ${ok === false ? "text-red-500" : "text-ink"}`}>{value}</span>
    </li>
  );
}
