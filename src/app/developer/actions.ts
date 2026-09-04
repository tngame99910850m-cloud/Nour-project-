"use server";

import { revalidatePath } from "next/cache";
import { saveSystemSettings, getSystemSettings, type SystemSettings, type HomepageSection } from "@/lib/settings";
import { requireDeveloperAccess } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export async function updateSeo(formData: FormData) {
  const session = await requireDeveloperAccess();
  await saveSystemSettings({
    seo: {
      defaultTitle: String(formData.get("defaultTitle") || ""),
      titleTemplate: String(formData.get("titleTemplate") || ""),
      defaultDescription: String(formData.get("defaultDescription") || ""),
      keywords: String(formData.get("keywords") || ""),
      ogImage: String(formData.get("ogImage") || ""),
      robots: String(formData.get("robots") || "index, follow"),
    },
  });
  await logAudit(session, { action: "system.seo", summary: "Updated SEO settings" });
  revalidatePath("/", "layout");
  revalidatePath("/developer/seo");
}

export async function updateAnalytics(formData: FormData) {
  const session = await requireDeveloperAccess();
  await saveSystemSettings({
    analytics: {
      gaMeasurementId: String(formData.get("gaMeasurementId") || ""),
      metaPixelId: String(formData.get("metaPixelId") || ""),
    },
  });
  await logAudit(session, { action: "system.analytics", summary: "Updated analytics IDs" });
  revalidatePath("/", "layout");
  revalidatePath("/developer/analytics");
}

export async function updateIntegrations(formData: FormData) {
  const session = await requireDeveloperAccess();
  await saveSystemSettings({
    integrations: {
      emailProvider: String(formData.get("emailProvider") || "none"),
      paymentProvider: String(formData.get("paymentProvider") || "manual"),
    },
  });
  await logAudit(session, { action: "system.integrations", summary: "Updated integrations" });
  revalidatePath("/developer/integrations");
}

export async function updateFeatures(formData: FormData) {
  const session = await requireDeveloperAccess();
  const features: SystemSettings["features"] = {
    storefrontEnabled: formData.get("storefrontEnabled") === "on",
    onlineOrdering: formData.get("onlineOrdering") === "on",
    whatsappOrdering: formData.get("whatsappOrdering") === "on",
    reviews: formData.get("reviews") === "on",
    discountCodes: formData.get("discountCodes") === "on",
    maintenanceMode: formData.get("maintenanceMode") === "on",
  };
  await saveSystemSettings({ features });
  await logAudit(session, { action: "system.features", summary: "Updated feature flags", after: features });
  revalidatePath("/", "layout");
  revalidatePath("/developer/features");
}

export async function updateHomepageSections(sections: HomepageSection[]) {
  const session = await requireDeveloperAccess();
  await saveSystemSettings({ homepageSections: sections });
  await logAudit(session, { action: "system.homepage", summary: "Updated homepage layout" });
  revalidatePath("/", "layout");
  revalidatePath("/developer/homepage");
}
