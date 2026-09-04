import { CartProvider } from "@/components/cart/cart-context";
import { StoreHeader } from "@/components/store/header";
import { StoreFooter } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { WhatsAppFab } from "@/components/store/whatsapp-fab";
import { getBusinessSettings, getSystemSettings } from "@/lib/settings";
import { generalInquiryMessage } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [business, system] = await Promise.all([getBusinessSettings(), getSystemSettings()]);

  if (system.features.maintenanceMode) {
    // A minimal maintenance screen instead of the storefront.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
        <h1 className="font-serif text-4xl font-semibold text-ink">{business.name}</h1>
        <p className="mt-4 max-w-md text-muted">
          We&apos;re making some improvements and will be back very soon. Thank you for your patience.
        </p>
        <a
          href={`https://wa.me/${business.whatsapp.replace(/[^\d]/g, "")}`}
          className="btn-primary btn-lg mt-8"
        >
          Contact us on WhatsApp
        </a>
      </div>
    );
  }

  const categories = await prisma.category
    .findMany({ where: { parentId: null, isActive: true }, select: { name: true, slug: true } })
    .catch(() => []);

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <StoreHeader
          businessName={business.name}
          logoUrl={business.logoUrl}
          whatsapp={business.whatsapp}
          categories={categories}
        />
        <main className="flex-1">{children}</main>
        <StoreFooter business={business} />
      </div>
      <CartDrawer currencySymbol={business.currencySymbol} />
      <WhatsAppFab number={business.whatsapp} message={generalInquiryMessage(business.name)} />
    </CartProvider>
  );
}
