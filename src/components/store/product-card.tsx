import Link from "next/link";
import Image from "next/image";
import { money, effectivePrice, discountPercent } from "@/lib/format";
import { toNumber } from "@/lib/utils";
import { QuickAddButton } from "./quick-add-button";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
  stock: number;
  isNew: boolean;
  isBestSeller: boolean;
}

export function ProductCard({ product, currencySymbol }: { product: ProductCardData; currencySymbol: string }) {
  const price = effectivePrice(product.price, product.salePrice);
  const off = discountPercent(product.price, product.salePrice);
  const image = product.images[0] || "";
  const soldOut = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-surface shadow-soft transition hover:shadow-card">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-canvas">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">No image</div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off ? <span className="badge bg-brand text-white">-{off}%</span> : null}
          {product.isNew ? <span className="badge bg-accent text-white">New</span> : null}
          {product.isBestSeller ? <span className="badge bg-ink text-white">Best Seller</span> : null}
        </div>
        {soldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="badge bg-ink text-white">Sold Out</span>
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-medium text-ink hover:text-brand">
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold text-brand">{money(price, currencySymbol)}</span>
          {product.salePrice ? (
            <span className="text-sm text-muted line-through">{money(toNumber(product.price), currencySymbol)}</span>
          ) : null}
        </div>
        <div className="mt-3">
          <QuickAddButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image,
              price,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  );
}
