"use client";

import Image from "next/image";
import { Phone, Mail, Globe, MapPin, Navigation, MessageCircle, Instagram, Facebook, Download, Clock, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { BusinessSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";

export function BusinessCard({
  business,
  qrDataUrl,
  cardUrl,
}: {
  business: BusinessSettings;
  qrDataUrl: string;
  cardUrl: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  const saveContact = () => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${business.name}`,
      `ORG:${business.name}`,
      `TEL;TYPE=CELL:${business.phone}`,
      business.email ? `EMAIL:${business.email}` : "",
      business.address ? `ADR;TYPE=WORK:;;${business.address};;;;` : "",
      cardUrl ? `URL:${cardUrl}` : "",
      `NOTE:${business.tagline}`,
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${business.name.replace(/\s+/g, "-")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Contact saved");
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: business.name, text: business.tagline, url: cardUrl });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(cardUrl);
      toast.success("Card link copied");
    }
  };

  const actions = [
    { label: "Call", icon: Phone, href: `tel:${business.phone.replace(/\s/g, "")}`, cls: "bg-brand text-white" },
    { label: "WhatsApp", icon: MessageCircle, href: whatsappLink(business.whatsapp), cls: "bg-green-500 text-white" },
    { label: "Directions", icon: Navigation, href: business.mapsUrl, cls: "bg-ink text-white" },
    { label: "Website", icon: Globe, href: siteUrl || "/", cls: "border border-black/10 bg-white text-ink" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/10 via-canvas to-canvas py-8">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="overflow-hidden rounded-3xl border border-black/5 bg-surface shadow-card">
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-r from-brand to-brand-dark">
            {business.hero.image ? (
              <Image src={business.hero.image} alt="" fill className="object-cover opacity-30" />
            ) : null}
          </div>
          <div className="-mt-14 flex flex-col items-center px-6 pb-6 text-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
              {business.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={business.logoUrl} alt={business.name} className="h-full w-full object-contain" />
              ) : (
                <span className="font-serif text-3xl font-semibold text-brand">
                  {business.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
              )}
            </div>
            <h1 className="mt-4 font-serif text-2xl font-semibold">{business.name}</h1>
            <p className="mt-1 text-sm text-muted">{business.tagline}</p>

            <button onClick={share} className="btn-ghost btn-sm mt-3"><Share2 className="h-4 w-4" /> Share this card</button>

            {/* Primary actions */}
            <div className="mt-5 grid w-full grid-cols-2 gap-3">
              {actions.map((a) => (
                <a
                  key={a.label}
                  href={a.href}
                  target={a.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`btn ${a.cls} py-3 text-sm`}
                >
                  <a.icon className="h-4 w-4" /> {a.label}
                </a>
              ))}
            </div>

            <button onClick={saveContact} className="btn-outline btn-md mt-3 w-full">
              <Download className="h-4 w-4" /> Save Contact
            </button>
          </div>

          {/* Details */}
          <div className="space-y-1 border-t border-black/5 px-6 py-5 text-sm">
            <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-black/5">
              <Phone className="h-4 w-4 text-brand" /> {business.phone}
            </a>
            <a href={`mailto:${business.email}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-black/5">
              <Mail className="h-4 w-4 text-brand" /> {business.email}
            </a>
            <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-black/5">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" /> {business.address}
            </a>
            {business.openingHours[0] ? (
              <div className="flex items-start gap-3 px-2 py-2.5">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                <div>
                  {business.openingHours.map((h) => (
                    <p key={h.day}>{h.day}: <span className="text-muted">{h.hours}</span></p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Socials */}
          <div className="flex justify-center gap-3 border-t border-black/5 px-6 py-5">
            {business.social.instagram ? <a href={business.social.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full bg-black/5 p-3 hover:bg-brand hover:text-white"><Instagram className="h-5 w-5" /></a> : null}
            {business.social.facebook ? <a href={business.social.facebook} target="_blank" rel="noopener noreferrer" className="rounded-full bg-black/5 p-3 hover:bg-brand hover:text-white"><Facebook className="h-5 w-5" /></a> : null}
            {business.social.tiktok ? <a href={business.social.tiktok} target="_blank" rel="noopener noreferrer" className="rounded-full bg-black/5 p-3 hover:bg-brand hover:text-white"><span className="text-sm font-bold">TT</span></a> : null}
          </div>

          {/* QR */}
          {qrDataUrl ? (
            <div className="flex flex-col items-center border-t border-black/5 px-6 py-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR code to this card" className="h-40 w-40" />
              <p className="mt-2 text-xs text-muted">Scan to open this card</p>
            </div>
          ) : null}
        </div>

        <p className="mt-6 text-center text-xs text-muted">Powered by {business.name}</p>
      </div>
    </div>
  );
}
