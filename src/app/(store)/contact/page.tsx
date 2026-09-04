import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { getBusinessSettings } from "@/lib/settings";
import { ContactForm } from "@/components/store/contact-form";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const business = await getBusinessSettings();

  return (
    <div className="container-px py-12">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Get in touch</span>
        <h1 className="section-title mt-2">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          We&apos;d love to help. Reach out via WhatsApp for the fastest response, or send us a message.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: Phone, label: "Phone", value: business.phone, href: `tel:${business.phone.replace(/\s/g, "")}` },
            { icon: Mail, label: "Email", value: business.email, href: `mailto:${business.email}` },
            { icon: MapPin, label: "Address", value: business.address, href: business.mapsUrl },
          ].map((c) => (
            <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-4 p-5 transition hover:shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand"><c.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">{c.label}</p>
                <p className="font-medium">{c.value}</p>
              </div>
            </a>
          ))}

          <a href={whatsappLink(business.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn w-full gap-2 bg-green-500 py-3.5 text-white hover:bg-green-600">
            Chat on WhatsApp
          </a>

          <div className="card p-5">
            <p className="flex items-center gap-2 font-semibold"><Clock className="h-4 w-4 text-brand" /> Opening Hours</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {business.openingHours.map((h) => (
                <li key={h.day} className="flex justify-between"><span>{h.day}</span><span>{h.hours}</span></li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            {business.social.instagram ? <a href={business.social.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full bg-black/5 p-3 hover:bg-brand hover:text-white"><Instagram className="h-5 w-5" /></a> : null}
            {business.social.facebook ? <a href={business.social.facebook} target="_blank" rel="noopener noreferrer" className="rounded-full bg-black/5 p-3 hover:bg-brand hover:text-white"><Facebook className="h-5 w-5" /></a> : null}
          </div>
        </div>

        <ContactForm businessName={business.name} whatsapp={business.whatsapp} />
      </div>
    </div>
  );
}
