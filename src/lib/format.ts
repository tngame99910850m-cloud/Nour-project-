import { toNumber } from "./utils";

/** Format a money value with the configured currency symbol. */
export function money(value: unknown, symbol = "AED"): string {
  const n = toNumber(value);
  return `${symbol} ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function moneyShort(value: unknown, symbol = "AED"): string {
  const n = toNumber(value);
  return `${symbol} ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/** Effective price of a product taking sale price into account. */
export function effectivePrice(price: unknown, salePrice: unknown): number {
  const p = toNumber(price);
  const s = toNumber(salePrice);
  return salePrice != null && s > 0 && s < p ? s : p;
}

export function discountPercent(price: unknown, salePrice: unknown): number | null {
  const p = toNumber(price);
  const s = toNumber(salePrice);
  if (salePrice == null || s <= 0 || s >= p) return null;
  return Math.round(((p - s) / p) * 100);
}
