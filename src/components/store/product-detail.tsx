"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, MessageCircle, Share2, Check, Truck } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-context";
import { money, discountPercent } from "@/lib/format";
import { whatsappLink, productInquiryMessage } from "@/lib/whatsapp";

interface Variant {
  id: string;
  name: string;
  value: string;
  priceDiff: number;
  stock: number;
}

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    salePrice: number | null;
    images: string[];
    stock: number;
    lowStockLevel: number;
    sku: string;
    tags: string[];
    categoryName?: string;
    variants: Variant[];
  };
  business: {
    name: string;
    whatsapp: string;
    currencySymbol: string;
    whatsappOrdering: boolean;
    onlineOrdering: boolean;
  };
  siteUrl: string;
}

export function ProductDetail({ product, business, siteUrl }: Props) {
  const { addItem, closeCart } = useCart();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(undefined);
  const [added, setAdded] = useState(false);

  const base = product.salePrice ?? product.price;
  const off = discountPercent(product.price, product.salePrice);
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= product.lowStockLevel;
  const cur = business.currencySymbol;
  const productUrl = `${siteUrl}/products/${product.slug}`;

  // Group variants by their "name" (e.g. Color, Size)
  const variantGroups = product.variants.reduce<Record<string, Variant[]>>((acc, v) => {
    (acc[v.name] ||= []).push(v);
    return acc;
  }, {});

  const buildCartItem = () => ({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0] || "",
    price: base,
    stock: product.stock,
    variant: selectedVariant,
  });

  const handleAdd = () => {
    if (soldOut) return;
    addItem(buildCartItem(), qty);
    setAdded(true);
    toast.success(`Added ${qty} × ${product.name} to cart`);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (soldOut) return;
    addItem(buildCartItem(), qty, false);
    closeCart();
    router.push("/checkout");
  };

  const handleShare = async () => {
    const shareData = { title: product.name, text: product.name, url: productUrl };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(productUrl);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Gallery */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-canvas">
          {product.images[activeImg] ? (
            <Image src={product.images[activeImg]} alt={product.name} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">No image</div>
          )}
          {off ? <span className="badge absolute left-4 top-4 bg-brand text-white">-{off}%</span> : null}
        </div>
        {product.images.length > 1 ? (
          <div className="mt-4 flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 ${
                  activeImg === i ? "border-brand" : "border-transparent"
                }`}
              >
                <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div>
        {product.categoryName ? (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{product.categoryName}</span>
        ) : null}
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">{product.name}</h1>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-semibold text-brand">{money(base, cur)}</span>
          {product.salePrice ? <span className="text-lg text-muted line-through">{money(product.price, cur)}</span> : null}
        </div>

        <div className="mt-3 flex items-center gap-3 text-sm">
          {soldOut ? (
            <span className="badge bg-red-100 text-red-700">Out of stock</span>
          ) : lowStock ? (
            <span className="badge bg-amber-100 text-amber-700">Only {product.stock} left</span>
          ) : (
            <span className="badge bg-green-100 text-green-700">In stock</span>
          )}
          <span className="text-muted">SKU: {product.sku}</span>
        </div>

        <p className="mt-6 leading-relaxed text-ink/80">{product.description}</p>

        {/* Variants */}
        {Object.entries(variantGroups).map(([name, opts]) => (
          <div key={name} className="mt-6">
            <span className="label">{name}</span>
            <div className="flex flex-wrap gap-2">
              {opts.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(`${name}: ${v.value}`)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    selectedVariant === `${name}: ${v.value}`
                      ? "border-brand bg-brand text-white"
                      : "border-black/15 hover:border-brand"
                  }`}
                >
                  {v.value}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Quantity + actions */}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex items-center rounded-full border border-black/15">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:text-brand" aria-label="Decrease quantity">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-medium">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(Math.max(product.stock, 1), q + 1))}
              className="p-3 hover:text-brand"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button onClick={handleShare} className="btn-ghost btn-md" aria-label="Share product">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {business.onlineOrdering ? (
            <>
              <button onClick={handleAdd} disabled={soldOut} className="btn-outline btn-lg flex-1">
                {added ? <><Check className="h-5 w-5" /> Added</> : <><ShoppingBag className="h-5 w-5" /> Add to Cart</>}
              </button>
              <button onClick={handleBuyNow} disabled={soldOut} className="btn-primary btn-lg flex-1">
                Buy Now
              </button>
            </>
          ) : null}
        </div>

        {business.whatsappOrdering ? (
          <a
            href={whatsappLink(business.whatsapp, productInquiryMessage(business.name, product.name, productUrl))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-3 w-full gap-2 bg-green-500 py-3.5 text-base text-white hover:bg-green-600"
          >
            <MessageCircle className="h-5 w-5" /> Ask about this product on WhatsApp
          </a>
        ) : null}

        <div className="mt-6 flex items-center gap-2 rounded-xl bg-brand/5 p-4 text-sm text-ink/80">
          <Truck className="h-5 w-5 text-brand" />
          Delivery available — choose your date &amp; time at checkout.
        </div>
      </div>
    </div>
  );
}
