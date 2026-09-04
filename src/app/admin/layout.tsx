import { requireBusinessAccess } from "@/lib/guard";
import { getBusinessSettings } from "@/lib/settings";
import { DashboardShell } from "@/components/dashboard/shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireBusinessAccess();
  const business = await getBusinessSettings();

  return (
    <DashboardShell
      title="Business Dashboard"
      variant="admin"
      user={{ name: session.name, role: session.role }}
      businessName={business.name}
    >
      {children}
    </DashboardShell>
  );
}
