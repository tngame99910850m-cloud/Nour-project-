"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { BusinessSettings } from "@/lib/settings";
import { updateBusinessSettings } from "@/app/admin/settings/actions";
import { Card } from "./ui";

function ColorField({ name, label, value }: { name: string; label: string; value: string }) {
  // value is "R G B"
  const toHex = (rgb: string) => {
    const [r, g, b] = rgb.split(" ").map((n) => parseInt(n, 10));
    if ([r, g, b].some((n) => Number.isNaN(n))) return "#000000";
    return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
  };
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          defaultValue={toHex(value)}
          onChange={(e) => {
            const hex = e.target.value;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            const input = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
            if (input) input.value = `${r} ${g} ${b}`;
          }}
          className="h-10 w-12 cursor-pointer rounded-lg border border-black/10"
        />
        <input name={name} defaultValue={value} className="input flex-1 font-mono text-xs" placeholder="R G B" />
      </div>
    </div>
  );
}

export function BusinessSettingsForm({ initial }: { initial: BusinessSettings }) {
  const [pending, start] = useTransition();

  return (
    <form
      action={(fd) => start(async () => { await updateBusinessSettings(fd); toast.success("Settings saved"); })}
      className="space-y-6"
    >
      <Card>
        <h2 className="mb-4 font-semibold">General</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Business name</label><input name="name" defaultValue={initial.name} className="input" /></div>
          <div><label className="label">Tagline</label><input name="tagline" defaultValue={initial.tagline} className="input" /></div>
          <div><label className="label">Logo URL</label><input name="logoUrl" defaultValue={initial.logoUrl} className="input" placeholder="https://…" /></div>
          <div><label className="label">Favicon URL</label><input name="faviconUrl" defaultValue={initial.faviconUrl} className="input" placeholder="https://…" /></div>
          <div><label className="label">Currency code</label><input name="currency" defaultValue={initial.currency} className="input" /></div>
          <div><label className="label">Currency symbol</label><input name="currencySymbol" defaultValue={initial.currencySymbol} className="input" /></div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Contact & Location</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Phone</label><input name="phone" defaultValue={initial.phone} className="input" /></div>
          <div><label className="label">WhatsApp number (digits only)</label><input name="whatsapp" defaultValue={initial.whatsapp} className="input" placeholder="971500000000" /></div>
          <div><label className="label">Email</label><input name="email" defaultValue={initial.email} className="input" /></div>
          <div><label className="label">Address</label><input name="address" defaultValue={initial.address} className="input" /></div>
          <div className="sm:col-span-2"><label className="label">Google Maps link</label><input name="mapsUrl" defaultValue={initial.mapsUrl} className="input" /></div>
          <div className="sm:col-span-2"><label className="label">Google Maps embed URL</label><input name="mapsEmbedUrl" defaultValue={initial.mapsEmbedUrl} className="input" /><p className="mt-1 text-xs text-muted">Google Maps → Share → Embed a map → copy the src URL.</p></div>
          <div><label className="label">Latitude</label><input name="latitude" defaultValue={initial.latitude} className="input" /></div>
          <div><label className="label">Longitude</label><input name="longitude" defaultValue={initial.longitude} className="input" /></div>
        </div>
        <div className="mt-4">
          <label className="label">Opening hours (one per line: Day | Hours)</label>
          <textarea name="openingHours" rows={3} defaultValue={initial.openingHours.map((h) => `${h.day} | ${h.hours}`).join("\n")} className="input" />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Social Media</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Instagram</label><input name="instagram" defaultValue={initial.social.instagram} className="input" /></div>
          <div><label className="label">Facebook</label><input name="facebook" defaultValue={initial.social.facebook} className="input" /></div>
          <div><label className="label">TikTok</label><input name="tiktok" defaultValue={initial.social.tiktok} className="input" /></div>
          <div><label className="label">Snapchat</label><input name="snapchat" defaultValue={initial.social.snapchat} className="input" /></div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Homepage Hero</h2>
        <div className="grid gap-4">
          <div><label className="label">Hero title</label><input name="heroTitle" defaultValue={initial.hero.title} className="input" /></div>
          <div><label className="label">Hero subtitle</label><textarea name="heroSubtitle" rows={2} defaultValue={initial.hero.subtitle} className="input" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Primary CTA text</label><input name="heroCtaPrimary" defaultValue={initial.hero.ctaPrimary} className="input" /></div>
            <div><label className="label">Secondary CTA text</label><input name="heroCtaSecondary" defaultValue={initial.hero.ctaSecondary} className="input" /></div>
          </div>
          <div><label className="label">Hero background image URL</label><input name="heroImage" defaultValue={initial.hero.image} className="input" /></div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">Content</h2>
        <div className="grid gap-4">
          <div><label className="label">About text</label><textarea name="aboutText" rows={3} defaultValue={initial.aboutText} className="input" /></div>
          <div><label className="label">Free delivery message</label><input name="freeDeliveryText" defaultValue={initial.freeDeliveryText} className="input" /></div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 font-semibold">Brand Colors</h2>
        <p className="mb-4 text-xs text-muted">Colors are in “R G B” format. Use the swatch to pick, then fine-tune the numbers.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ColorField name="primary" label="Primary" value={initial.theme.primary} />
          <ColorField name="primaryLight" label="Primary light" value={initial.theme.primaryLight} />
          <ColorField name="primaryDark" label="Primary dark (buttons hover)" value={initial.theme.primaryDark} />
          <ColorField name="accent" label="Accent (gold)" value={initial.theme.accent} />
          <ColorField name="ink" label="Text (ink)" value={initial.theme.ink} />
          <ColorField name="canvas" label="Background" value={initial.theme.canvas} />
          <ColorField name="surface" label="Surface (cards)" value={initial.theme.surface} />
        </div>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <button type="submit" disabled={pending} className="btn-primary btn-lg shadow-card">
          {pending ? "Saving…" : "Save all settings"}
        </button>
      </div>
    </form>
  );
}
