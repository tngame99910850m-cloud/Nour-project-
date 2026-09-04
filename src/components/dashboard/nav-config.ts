"use client";

import {
  LayoutDashboard, ShoppingCart, Package, FolderTree, Boxes, Users, Truck,
  Megaphone, Ticket, Settings, IdCard, BarChart3, ScrollText,
  Globe, Search, LineChart, Plug, ToggleLeft, Server, LayoutTemplate,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ADMIN_NAV: NavItem[] = [
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

export const DEVELOPER_NAV: NavItem[] = [
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
