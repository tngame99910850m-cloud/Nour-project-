import { MapPin, Navigation, Phone, Clock } from "lucide-react";
import { getBusinessSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = { title: "Our Location" };

export default async function LocationPage() {
  const business = await getBusinessSettings();

  return (
    <div className="container-px py-12">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Find us</span>
        <h1 className="section-title mt-2">Our Location</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <iframe
            title="Business location map"
            src={business.mapsEmbedUrl}
            className="h-[420px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <MapPin className="h-7 w-7 text-brand" />
            <h2 className="mt-3 font-serif text-xl font-semibold">Address</h2>
            <p className="mt-2 text-muted">{business.address}</p>
            <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary btn-md mt-4 w-full">
              <Navigation className="h-4 w-4" /> Get Directions
            </a>
          </div>

          <div className="card p-6">
            <Clock className="h-6 w-6 text-brand" />
            <h3 className="mt-2 font-semibold">Opening Hours</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {business.openingHours.map((h) => (
                <li key={h.day} className="flex justify-between"><span>{h.day}</span><span>{h.hours}</span></li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <Phone className="h-6 w-6 text-brand" />
            <h3 className="mt-2 font-semibold">Contact</h3>
            <p className="mt-2 text-sm text-muted">{business.phone}</p>
            <div className="mt-4 flex gap-2">
              <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="btn-outline btn-sm flex-1">Call</a>
              <a href={whatsappLink(business.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-sm flex-1 bg-green-500 text-white hover:bg-green-600">WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
