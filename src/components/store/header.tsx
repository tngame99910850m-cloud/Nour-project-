"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Search, MessageCircle } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { whatsappLink, generalInquiryMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface Props {
  businessName: string;
  logoUrl: string;
  whatsapp: string;
  categories: { name: string; slug: string }[];
}

const NAV = [
  { label: "Home", href: "/" },
  { label: "Wedding", href: "/collections/wedding" },
  { label: "Home", href: "/collections/home" },
  { label: "All Products", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "Location", href: "/location" },
];

export function StoreHeader({ businessName, logoUrl, whatsapp }: Props) {
  const { count, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-surface/90 backdrop-blur-md">
      <div className="container-px flex h-16 items-center justify-between gap-4 lg:h-20">
        <div className="flex items-center gap-2 lg:hidden">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-2">
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={businessName} className="h-9 w-auto" />
          ) : (
            <span className="font-serif text-2xl font-semibold tracking-tight text-ink">
              {businessName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium text-ink/80 transition hover:text-brand",
                pathname === item.href && "text-brand",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/products" aria-label="Search products" className="rounded-full p-2 hover:bg-black/5">
            <Search className="h-5 w-5" />
          </Link>
          <a
            href={whatsappLink(whatsapp, generalInquiryMessage(businessName))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact on WhatsApp"
            className="hidden rounded-full p-2 text-green-600 hover:bg-green-50 sm:inline-flex"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <button onClick={openCart} aria-label="Open cart" className="relative rounded-full p-2 hover:bg-black/5">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-surface p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-serif text-xl font-semibold">{businessName}</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium hover:bg-black/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <a
              href={whatsappLink(whatsapp, generalInquiryMessage(businessName))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-6 w-full gap-2 bg-green-500 px-5 py-3 text-white hover:bg-green-600"
            >
              <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
