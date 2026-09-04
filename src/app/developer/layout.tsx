import { requireDeveloperAccess } from "@/lib/guard";
import { getBusinessSettings } from "@/lib/settings";
import { DashboardShell } from "@/components/dashboard/shell";

export const dynamic = "force-dynamic";

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const session = await requireDeveloperAccess();
  const business = await getBusinessSettings();

  return (
    <DashboardShell
      title="Developer Portal"
      variant="developer"
      user={{ name: session.name, role: session.role }}
      businessName={business.name}
    >
      {children}
    </DashboardShell>
  );
}
