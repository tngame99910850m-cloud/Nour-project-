import {
  LayoutDashboard, Globe, Search, LineChart, Plug, Truck, ToggleLeft,
  Users, ScrollText, Server, LayoutTemplate,
} from "lucide-react";
import { requireDeveloperAccess } from "@/lib/guard";
import { getBusinessSettings } from "@/lib/settings";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

export const dynamic = "force-dynamic";

const NAV: NavItem[] = [
  { label: "System Overview", href: "/developer", icon: LayoutDashboard },
  { label: "Website Config", href: "/developer/website", icon: Globe },
  { label: "Homepage Builder", href: "/developer/homepage", icon: LayoutTemplate },
  { label: "SEO", href: "/developer/seo", icon: Search },
  { label: "Analytics", href: "/developer/analytics", icon: LineChart },
  { label: "Integrations", href: "/developer/integrations", icon: Plug },
  { label: "Delivery Config", href: "/developer/delivery", icon: Truck },
  { label: "Feature Flags", href: "/developer/features", icon: ToggleLeft },
  { label: "Users & Roles", href: "/developer/users", icon: Users },
  { label: "Audit Logs", href: "/developer/audit", icon: ScrollText },
  { label: "Deployment", href: "/developer/system", icon: Server },
];

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const session = await requireDeveloperAccess();
  const business = await getBusinessSettings();

  return (
    <DashboardShell
      title="Developer Portal"
      variant="developer"
      nav={NAV}
      user={{ name: session.name, role: session.role }}
      businessName={business.name}
    >
      {children}
    </DashboardShell>
  );
}
