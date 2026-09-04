import "server-only";

export interface EnvCheck {
  key: string;
  label: string;
  required: boolean;
  present: boolean;
  hint: string;
}

/** Report presence (never values) of environment variables. */
export function getEnvChecks(): EnvCheck[] {
  const has = (k: string) => Boolean(process.env[k] && process.env[k]!.length > 0);
  return [
    { key: "DATABASE_URL", label: "Database URL", required: true, present: has("DATABASE_URL"), hint: "PostgreSQL connection string" },
    { key: "DIRECT_URL", label: "Database Direct URL", required: false, present: has("DIRECT_URL"), hint: "Direct connection (migrations)" },
    { key: "AUTH_SECRET", label: "Auth Secret", required: true, present: has("AUTH_SECRET"), hint: "Signs session tokens (min 32 chars)" },
    { key: "NEXT_PUBLIC_SITE_URL", label: "Public Site URL", required: true, present: has("NEXT_PUBLIC_SITE_URL"), hint: "Canonical URL of the site" },
    { key: "NEXT_PUBLIC_GA_MEASUREMENT_ID", label: "Google Analytics ID", required: false, present: has("NEXT_PUBLIC_GA_MEASUREMENT_ID"), hint: "Optional (also settable in dashboard)" },
    { key: "NEXT_PUBLIC_META_PIXEL_ID", label: "Meta Pixel ID", required: false, present: has("NEXT_PUBLIC_META_PIXEL_ID"), hint: "Optional" },
    { key: "SMTP_HOST", label: "SMTP Host", required: false, present: has("SMTP_HOST"), hint: "Email notifications (optional)" },
    { key: "STRIPE_SECRET_KEY", label: "Stripe Secret Key", required: false, present: has("STRIPE_SECRET_KEY"), hint: "Payments (optional)" },
  ];
}
