import type { Metadata } from "next";
import QRCode from "qrcode";
import { getBusinessSettings } from "@/lib/settings";
import { BusinessCard } from "@/components/store/business-card";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const business = await getBusinessSettings();
  return {
    title: `${business.name} — Digital Card`,
    description: business.tagline,
  };
}

export default async function CardPage() {
  const business = await getBusinessSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const cardUrl = `${siteUrl}/card`;

  const qrDataUrl = await QRCode.toDataURL(cardUrl, {
    margin: 1,
    width: 320,
    color: { dark: "#26221fff", light: "#ffffffff" },
  }).catch(() => "");

  return <BusinessCard business={business} qrDataUrl={qrDataUrl} cardUrl={cardUrl} />;
}
