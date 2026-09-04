import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, type ProductCardData } from "./product-card";

export function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</span>
        ) : null}
        <h2 className="section-title mt-1">{title}</h2>
      </div>
      {href ? (
        <Link href={href} className="group hidden items-center gap-1 text-sm font-medium text-brand hover:gap-2 sm:inline-flex">
          {linkLabel} <ArrowRight className="h-4 w-4 transition-all" />
        </Link>
      ) : null}
    </div>
  );
}

export function ProductGrid({
  products,
  currencySymbol,
}: {
  products: ProductCardData[];
  currencySymbol: string;
}) {
  if (products.length === 0) {
    return <p className="text-sm text-muted">No products to show yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} currencySymbol={currencySymbol} />
      ))}
    </div>
  );
}
