import { prisma } from "./prisma";

// ---------------------------------------------------------------------------
//  Business settings — editable by OWNER / ADMIN from the business dashboard.
// ---------------------------------------------------------------------------
export interface BusinessSettings {
  name: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  currency: string;
  currencySymbol: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  latitude: string;
  longitude: string;
  openingHours: { day: string; hours: string }[];
  social: {
    instagram: string;
    facebook: string;
    tiktok: string;
    snapchat: string;
  };
  theme: {
    primary: string; // "R G B"
    primaryLight: string;
    primaryDark: string;
    accent: string;
    ink: string;
    surface: string;
    canvas: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    image: string;
  };
  aboutText: string;
  freeDeliveryText: string;
}

// ---------------------------------------------------------------------------
//  System settings — editable by DEVELOPER only.
// ---------------------------------------------------------------------------
export interface SystemSettings {
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    keywords: string;
    ogImage: string;
    robots: string;
  };
  analytics: {
    gaMeasurementId: string;
    metaPixelId: string;
  };
  features: {
    storefrontEnabled: boolean;
    onlineOrdering: boolean;
    whatsappOrdering: boolean;
    reviews: boolean;
    discountCodes: boolean;
    maintenanceMode: boolean;
  };
  homepageSections: HomepageSection[];
  integrations: {
    emailProvider: string; // "smtp" | "none"
    paymentProvider: string; // "manual" | "stripe" | "none"
  };
}

export interface HomepageSection {
  key: string;
  label: string;
  enabled: boolean;
  order: number;
}

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  { key: "hero", label: "Hero Banner", enabled: true, order: 0 },
  { key: "categories", label: "Categories", enabled: true, order: 1 },
  { key: "featured", label: "Featured Products", enabled: true, order: 2 },
  { key: "wedding", label: "Wedding Collection", enabled: true, order: 3 },
  { key: "home", label: "Home Collection", enabled: true, order: 4 },
  { key: "bestsellers", label: "Best Sellers", enabled: true, order: 5 },
  { key: "new", label: "New Arrivals", enabled: true, order: 6 },
  { key: "offers", label: "Special Offers", enabled: true, order: 7 },
  { key: "delivery", label: "Delivery Info", enabled: true, order: 8 },
  { key: "testimonials", label: "Testimonials", enabled: true, order: 9 },
  { key: "about", label: "About the Business", enabled: true, order: 10 },
  { key: "location", label: "Location", enabled: true, order: 11 },
  { key: "contact", label: "Contact", enabled: true, order: 12 },
];

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  name: "Nour Boutique",
  tagline: "Timeless wedding & home elegance",
  logoUrl: "",
  faviconUrl: "",
  currency: "AED",
  currencySymbol: "AED",
  phone: "+971 50 000 0000",
  whatsapp: "971500000000",
  email: "hello@nourboutique.com",
  address: "Shop 12, Al Wasl Road, Jumeirah, Dubai, UAE",
  mapsUrl: "https://maps.google.com/?q=Jumeirah+Dubai",
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610!2d55.24!3d25.20",
  latitude: "25.2048",
  longitude: "55.2708",
  openingHours: [
    { day: "Saturday – Thursday", hours: "10:00 AM – 10:00 PM" },
    { day: "Friday", hours: "2:00 PM – 10:00 PM" },
  ],
  social: {
    instagram: "https://instagram.com/nourboutique",
    facebook: "https://facebook.com/nourboutique",
    tiktok: "https://tiktok.com/@nourboutique",
    snapchat: "",
  },
  theme: {
    primary: "180 120 95", // warm rose-gold / taupe
    primaryLight: "205 160 138",
    primaryDark: "138 88 68",
    accent: "196 160 92", // gold
    ink: "38 34 32",
    surface: "255 255 255",
    canvas: "250 247 244",
  },
  hero: {
    title: "Elegance for your most precious moments",
    subtitle:
      "Curated wedding décor and refined home accessories — beautifully crafted, delivered to your door.",
    ctaPrimary: "Shop Now",
    ctaSecondary: "Explore Wedding Collection",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
  },
  aboutText:
    "Nour Boutique brings together handpicked wedding and home pieces that blend timeless elegance with modern craftsmanship. From your special day to your everyday, we help you celebrate life's beautiful moments.",
  freeDeliveryText: "Free delivery on orders above AED 300",
};

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  seo: {
    defaultTitle: "Nour Boutique — Wedding & Home Elegance",
    titleTemplate: "%s | Nour Boutique",
    defaultDescription:
      "Premium wedding décor and home accessories. Shop curated collections with fast local delivery.",
    keywords:
      "wedding decorations, home accessories, wedding gifts, home decor, table accessories, event decor",
    ogImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    robots: "index, follow",
  },
  analytics: {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  },
  features: {
    storefrontEnabled: true,
    onlineOrdering: true,
    whatsappOrdering: true,
    reviews: true,
    discountCodes: true,
    maintenanceMode: false,
  },
  homepageSections: DEFAULT_HOMEPAGE_SECTIONS,
  integrations: {
    emailProvider: "none",
    paymentProvider: "manual",
  },
};

function deepMerge<T>(base: T, override: Partial<T> | undefined | null): T {
  if (!override) return base;
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...base };
  for (const key of Object.keys(override as object)) {
    const o = (override as any)[key];
    const b = (base as any)[key];
    if (o == null) continue;
    if (Array.isArray(o)) {
      out[key] = o;
    } else if (typeof o === "object" && typeof b === "object" && b !== null) {
      out[key] = deepMerge(b, o);
    } else {
      out[key] = o;
    }
  }
  return out as T;
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  try {
    const row = await prisma.setting.findUnique({ where: { id: "business" } });
    return deepMerge(DEFAULT_BUSINESS_SETTINGS, row?.data as Partial<BusinessSettings>);
  } catch {
    return DEFAULT_BUSINESS_SETTINGS;
  }
}

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const row = await prisma.setting.findUnique({ where: { id: "system" } });
    return deepMerge(DEFAULT_SYSTEM_SETTINGS, row?.data as Partial<SystemSettings>);
  } catch {
    return DEFAULT_SYSTEM_SETTINGS;
  }
}

export async function saveBusinessSettings(data: Partial<BusinessSettings>) {
  const current = await getBusinessSettings();
  const merged = deepMerge(current, data);
  await prisma.setting.upsert({
    where: { id: "business" },
    create: { id: "business", data: merged as any },
    update: { data: merged as any },
  });
  return merged;
}

export async function saveSystemSettings(data: Partial<SystemSettings>) {
  const current = await getSystemSettings();
  const merged = deepMerge(current, data);
  await prisma.setting.upsert({
    where: { id: "system" },
    create: { id: "system", data: merged as any },
    update: { data: merged as any },
  });
  return merged;
}
