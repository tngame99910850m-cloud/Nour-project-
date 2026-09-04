import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div>
      <PageHeader title="Audit Logs" description="A record of important actions taken in the system." />
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-surface">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Details</th></tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-canvas/50">
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDateTime(l.createdAt)}</td>
                  <td className="px-4 py-3">{l.userName ?? "System"}</td>
                  <td className="px-4 py-3"><span className="badge bg-brand/10 text-brand">{l.action}</span></td>
                  <td className="px-4 py-3 text-muted">{l.summary}</td>
                </tr>
              ))}
              {logs.length === 0 ? <tr><td colSpan={4} className="px-4 py-12 text-center text-muted">No activity recorded yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
