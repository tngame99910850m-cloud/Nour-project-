import Link from "next/link";
import { Palette, Search, LayoutTemplate, Store, IdCard, MapPin, MessageCircle } from "lucide-react";
import { getBusinessSettings } from "@/lib/settings";
import { PageHeader, Card } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function WebsiteConfigPage() {
  const business = await getBusinessSettings();

  const links = [
    { icon: Palette, title: "Branding & Colors", desc: "Logo, favicon, theme colors, fonts", href: "/admin/settings" },
    { icon: LayoutTemplate, title: "Homepage Builder", desc: "Enable, disable and reorder sections", href: "/developer/homepage" },
    { icon: Search, title: "SEO", desc: "Titles, descriptions, structured data", href: "/developer/seo" },
    { icon: Store, title: "Business Info", desc: "Contact, address, hours, socials", href: "/admin/settings" },
    { icon: MapPin, title: "Google Maps", desc: "Map location and directions", href: "/admin/settings" },
    { icon: MessageCircle, title: "WhatsApp", desc: "Business WhatsApp number", href: "/admin/settings" },
    { icon: IdCard, title: "Digital Card", desc: "Shareable business card & QR", href: "/admin/card" },
  ];

  return (
    <div>
      <PageHeader title="Website Configuration" description="Everything that controls how your site looks and behaves." />
      <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
        Configuring <strong>{business.name}</strong>. Business content (name, colors, contact) lives in Business Settings; technical
        controls (SEO, features, integrations) live here in the Developer Portal.
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link key={l.title} href={l.href}>
            <Card className="h-full transition hover:shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand"><l.icon className="h-5 w-5" /></div>
              <h3 className="mt-3 font-semibold">{l.title}</h3>
              <p className="mt-1 text-sm text-muted">{l.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
