import {
  LayoutDashboard, ShoppingCart, Package, FolderTree, Boxes, Users, Truck,
  Megaphone, Ticket, Settings, IdCard, BarChart3, ScrollText,
} from "lucide-react";
import { requireBusinessAccess } from "@/lib/guard";
import { getBusinessSettings } from "@/lib/settings";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

export const dynamic = "force-dynamic";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Delivery", href: "/admin/delivery", icon: Truck },
  { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { label: "Discounts", href: "/admin/discounts", icon: Ticket },
  { label: "Business Settings", href: "/admin/settings", icon: Settings },
  { label: "Digital Card", href: "/admin/card", icon: IdCard },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Audit Logs", href: "/admin/audit", icon: ScrollText },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireBusinessAccess();
  const business = await getBusinessSettings();

  return (
    <DashboardShell
      title="Business Dashboard"
      variant="admin"
      nav={NAV}
      user={{ name: session.name, role: session.role }}
      businessName={business.name}
    >
      {children}
    </DashboardShell>
  );
}
