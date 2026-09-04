import Link from "next/link";
import { Instagram, Facebook, MapPin, Phone, Mail, Clock } from "lucide-react";
import type { BusinessSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";

export function StoreFooter({ business }: { business: BusinessSettings }) {
  return (
    <footer className="mt-20 border-t border-black/5 bg-ink text-white/80">
      <div className="container-px grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-white">{business.name}</h3>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">{business.tagline}</p>
          <div className="mt-5 flex gap-3">
            {business.social.instagram ? (
              <a href={business.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full bg-white/10 p-2.5 hover:bg-white/20">
                <Instagram className="h-4 w-4" />
              </a>
            ) : null}
            {business.social.facebook ? (
              <a href={business.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full bg-white/10 p-2.5 hover:bg-white/20">
                <Facebook className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/collections/wedding" className="hover:text-white">Wedding Collection</Link></li>
            <li><Link href="/collections/home" className="hover:text-white">Home Collection</Link></li>
            <li><Link href="/products" className="hover:text-white">All Products</Link></li>
            <li><Link href="/card" className="hover:text-white">Digital Business Card</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link href="/location" className="hover:text-white">Our Location</Link></li>
            <li><a href={whatsappLink(business.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Get in touch</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-light" /> {business.address}</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-light" /> {business.phone}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-light" /> {business.email}</li>
            {business.openingHours[0] ? (
              <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-light" /> {business.openingHours[0].day}: {business.openingHours[0].hours}</li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-px flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} {business.name}. All rights reserved.</span>
          <span>Free delivery on qualifying orders · Secure checkout</span>
        </div>
      </div>
    </footer>
  );
}
