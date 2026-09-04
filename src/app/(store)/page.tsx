import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, ShieldCheck, MessageCircle, Sparkles, Star, MapPin } from "lucide-react";
import { getBusinessSettings, getSystemSettings } from "@/lib/settings";
import {
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
  getOnSale,
  getProductsByGroup,
} from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { isEmbeddableMapUrl } from "@/lib/utils";
import { SectionHeader, ProductGrid } from "@/components/store/section";
import { whatsappLink, generalInquiryMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [business, system] = await Promise.all([getBusinessSettings(), getSystemSettings()]);
  const cur = business.currencySymbol;

  const [featured, bestSellers, newArrivals, onSale, wedding, home, categories, testimonials] =
    await Promise.all([
      getFeaturedProducts(8),
      getBestSellers(4),
      getNewArrivals(4),
      getOnSale(4),
      getProductsByGroup("WEDDING", 4),
      getProductsByGroup("HOME", 4),
      prisma.category.findMany({ where: { parentId: null, isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    ]);

  const sections = [...system.homepageSections].filter((s) => s.enabled).sort((a, b) => a.order - b.order);
  const enabled = (key: string) => sections.some((s) => s.key === key);

  return (
    <div className="space-y-20 pb-4">
      {/* HERO */}
      {enabled("hero") ? (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            {business.hero.image ? (
              <Image src={business.hero.image} alt="" fill priority className="object-cover" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent" />
          </div>
          <div className="container-px relative flex min-h-[78vh] flex-col justify-center py-20 text-white">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> {business.tagline}
            </span>
            <h1 className="max-w-2xl font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {business.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">{business.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn bg-white px-7 py-3.5 text-base font-medium text-ink hover:bg-white/90">
                {business.hero.ctaPrimary} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/collections/wedding" className="btn border border-white/60 px-7 py-3.5 text-base font-medium text-white hover:bg-white/10">
                {business.hero.ctaSecondary}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* TRUST BAR */}
      <section className="container-px -mt-8">
        <div className="grid gap-4 rounded-2xl border border-black/5 bg-surface p-6 shadow-soft sm:grid-cols-3">
          {[
            { icon: Truck, title: "Fast Local Delivery", desc: business.freeDeliveryText },
            { icon: ShieldCheck, title: "Trusted Quality", desc: "Handpicked, premium products" },
            { icon: MessageCircle, title: "Order via WhatsApp", desc: "Personal service, quick replies" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {enabled("categories") ? (
        <section className="container-px">
          <SectionHeader eyebrow="Shop by" title="Our Collections" />
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.group.toLowerCase()}`}
                className="group relative flex h-56 items-end overflow-hidden rounded-2xl bg-canvas"
              >
                {c.image ? (
                  <Image src={c.image} alt={c.name} fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="relative p-6 text-white">
                  <h3 className="font-serif text-2xl font-semibold">{c.name} Collection</h3>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm">Explore <ArrowRight className="h-4 w-4" /></p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* FEATURED */}
      {enabled("featured") && featured.length > 0 ? (
        <section className="container-px">
          <SectionHeader eyebrow="Handpicked" title="Featured Products" href="/products" />
          <ProductGrid products={featured} currencySymbol={cur} />
        </section>
      ) : null}

      {/* WEDDING */}
      {enabled("wedding") && wedding.length > 0 ? (
        <section className="container-px">
          <SectionHeader eyebrow="For your big day" title="Wedding Collection" href="/collections/wedding" />
          <ProductGrid products={wedding} currencySymbol={cur} />
        </section>
      ) : null}

      {/* HOME */}
      {enabled("home") && home.length > 0 ? (
        <section className="container-px">
          <SectionHeader eyebrow="For your space" title="Home Collection" href="/collections/home" />
          <ProductGrid products={home} currencySymbol={cur} />
        </section>
      ) : null}

      {/* BEST SELLERS */}
      {enabled("bestsellers") && bestSellers.length > 0 ? (
        <section className="container-px">
          <SectionHeader eyebrow="Loved by customers" title="Best Sellers" href="/products?sort=bestselling" />
          <ProductGrid products={bestSellers} currencySymbol={cur} />
        </section>
      ) : null}

      {/* NEW */}
      {enabled("new") && newArrivals.length > 0 ? (
        <section className="container-px">
          <SectionHeader eyebrow="Just in" title="New Arrivals" href="/products?filter=new" />
          <ProductGrid products={newArrivals} currencySymbol={cur} />
        </section>
      ) : null}

      {/* OFFERS */}
      {enabled("offers") && onSale.length > 0 ? (
        <section className="bg-brand/5 py-16">
          <div className="container-px">
            <SectionHeader eyebrow="Limited time" title="Special Offers" href="/products?filter=sale" />
            <ProductGrid products={onSale} currencySymbol={cur} />
          </div>
        </section>
      ) : null}

      {/* DELIVERY */}
      {enabled("delivery") ? (
        <section className="container-px">
          <div className="grid items-center gap-8 rounded-3xl bg-ink p-8 text-white sm:p-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-light">Delivery</span>
              <h2 className="mt-2 font-serif text-3xl font-semibold">We deliver to your door</h2>
              <p className="mt-3 max-w-md text-white/70">{business.freeDeliveryText}. Choose your delivery date and preferred time at checkout — we handle the rest.</p>
              <Link href="/products" className="btn bg-white px-6 py-3 text-ink hover:bg-white/90 mt-6">Start Shopping <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[["Same day", "Within city"], ["1-2 days", "Wider areas"], ["Track", "Every order"]].map(([a, b]) => (
                <div key={a} className="rounded-2xl bg-white/10 p-4">
                  <p className="font-serif text-2xl font-semibold">{a}</p>
                  <p className="mt-1 text-xs text-white/60">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* TESTIMONIALS */}
      {enabled("testimonials") && testimonials.length > 0 ? (
        <section className="container-px">
          <SectionHeader eyebrow="Kind words" title="What our customers say" />
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.id} className="card p-6">
                <div className="flex gap-0.5 text-accent">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink/80">&ldquo;{t.text}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold">{t.name}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ABOUT */}
      {enabled("about") ? (
        <section className="container-px">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Our story</span>
            <h2 className="section-title mt-2">About {business.name}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted">{business.aboutText}</p>
          </div>
        </section>
      ) : null}

      {/* LOCATION + CONTACT */}
      {enabled("location") ? (
        <section className="container-px">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card overflow-hidden">
              {isEmbeddableMapUrl(business.mapsEmbedUrl) ? (
                <iframe
                  title="Business location"
                  src={business.mapsEmbedUrl}
                  className="h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <a
                  href={business.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-72 w-full flex-col items-center justify-center gap-3 bg-canvas text-center"
                >
                  <MapPin className="h-10 w-10 text-brand" />
                  <span className="font-serif text-lg font-semibold">{business.address}</span>
                  <span className="btn-primary btn-md">Open in Google Maps</span>
                </a>
              )}
            </div>
            <div className="card flex flex-col justify-center p-8">
              <MapPin className="h-8 w-8 text-brand" />
              <h3 className="mt-3 font-serif text-2xl font-semibold">Visit our store</h3>
              <p className="mt-2 text-muted">{business.address}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary btn-md">Get Directions</a>
                <a href={whatsappLink(business.whatsapp, generalInquiryMessage(business.name))} target="_blank" rel="noopener noreferrer" className="btn-outline btn-md">Contact Us</a>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
