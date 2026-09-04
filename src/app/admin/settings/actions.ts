"use server";

import { revalidatePath } from "next/cache";
import { saveBusinessSettings, type BusinessSettings } from "@/lib/settings";
import { requireBusinessAccess } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export async function updateBusinessSettings(formData: FormData) {
  const session = await requireBusinessAccess();

  const hoursRaw = String(formData.get("openingHours") || "");
  const openingHours = hoursRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day, ...rest] = line.split("|");
      return { day: day.trim(), hours: rest.join("|").trim() };
    })
    .filter((h) => h.day && h.hours);

  const data: Partial<BusinessSettings> = {
    name: String(formData.get("name") || ""),
    tagline: String(formData.get("tagline") || ""),
    logoUrl: String(formData.get("logoUrl") || ""),
    faviconUrl: String(formData.get("faviconUrl") || ""),
    currency: String(formData.get("currency") || "AED"),
    currencySymbol: String(formData.get("currencySymbol") || "AED"),
    phone: String(formData.get("phone") || ""),
    whatsapp: String(formData.get("whatsapp") || ""),
    email: String(formData.get("email") || ""),
    address: String(formData.get("address") || ""),
    mapsUrl: String(formData.get("mapsUrl") || ""),
    mapsEmbedUrl: String(formData.get("mapsEmbedUrl") || ""),
    latitude: String(formData.get("latitude") || ""),
    longitude: String(formData.get("longitude") || ""),
    openingHours: openingHours.length ? openingHours : undefined,
    aboutText: String(formData.get("aboutText") || ""),
    freeDeliveryText: String(formData.get("freeDeliveryText") || ""),
    social: {
      instagram: String(formData.get("instagram") || ""),
      facebook: String(formData.get("facebook") || ""),
      tiktok: String(formData.get("tiktok") || ""),
      snapchat: String(formData.get("snapchat") || ""),
    },
    hero: {
      title: String(formData.get("heroTitle") || ""),
      subtitle: String(formData.get("heroSubtitle") || ""),
      ctaPrimary: String(formData.get("heroCtaPrimary") || ""),
      ctaSecondary: String(formData.get("heroCtaSecondary") || ""),
      image: String(formData.get("heroImage") || ""),
    },
    theme: {
      primary: String(formData.get("primary") || ""),
      primaryLight: String(formData.get("primaryLight") || ""),
      primaryDark: String(formData.get("primaryDark") || ""),
      accent: String(formData.get("accent") || ""),
      ink: String(formData.get("ink") || ""),
      surface: String(formData.get("surface") || ""),
      canvas: String(formData.get("canvas") || ""),
    },
  };

  await saveBusinessSettings(data);
  await logAudit(session, { action: "settings.business", entity: "Setting", summary: "Updated business settings" });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}
