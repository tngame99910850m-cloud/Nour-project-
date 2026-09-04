import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { getBusinessSettings, getSystemSettings } from "@/lib/settings";
import { Analytics } from "@/components/analytics";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [business, system] = await Promise.all([getBusinessSettings(), getSystemSettings()]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: system.seo.defaultTitle,
      template: system.seo.titleTemplate,
    },
    description: system.seo.defaultDescription,
    keywords: system.seo.keywords.split(",").map((k) => k.trim()),
    robots: system.seo.robots,
    icons: business.faviconUrl ? { icon: business.faviconUrl } : undefined,
    openGraph: {
      title: system.seo.defaultTitle,
      description: system.seo.defaultDescription,
      type: "website",
      images: system.seo.ogImage ? [system.seo.ogImage] : [],
      siteName: business.name,
    },
    twitter: {
      card: "summary_large_image",
      title: system.seo.defaultTitle,
      description: system.seo.defaultDescription,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#8a5844",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const business = await getBusinessSettings();
  const system = await getSystemSettings();
  const t = business.theme;

  const themeVars = `:root{
    --color-primary:${t.primary};
    --color-primary-light:${t.primaryLight};
    --color-primary-dark:${t.primaryDark};
    --color-accent:${t.accent};
    --color-ink:${t.ink};
    --color-surface:${t.surface};
    --color-canvas:${t.canvas};
  }`;

  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeVars }} />
      </head>
      <body>
        {children}
        <Toaster position="top-center" richColors closeButton />
        <Analytics
          gaId={system.analytics.gaMeasurementId}
          pixelId={system.analytics.metaPixelId}
        />
      </body>
    </html>
  );
}
