"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { money } from "@/lib/format";

export function CartView({ currencySymbol, freeDeliveryText }: { currencySymbol: string; freeDeliveryText: string }) {
  const { items, updateQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-px py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted/30" />
        <h1 className="mt-6 font-serif text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted">Browse our collections and add something beautiful.</p>
        <Link href="/products" className="btn-primary btn-lg mt-8">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="container-px py-10">
      <h1 className="section-title mb-8">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-black/5 rounded-2xl border border-black/5 bg-surface">
            {items.map((i) => (
              <li key={`${i.productId}-${i.variant ?? ""}`} className="flex gap-4 p-4 sm:p-5">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-canvas">
                  {i.image ? <Image src={i.image} alt={i.name} fill sizes="96px" className="object-cover" /> : null}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <Link href={`/products/${i.slug}`} className="font-medium hover:text-brand">{i.name}</Link>
                    <button onClick={() => removeItem(i.productId, i.variant)} className="text-muted hover:text-red-500" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {i.variant ? <span className="text-xs text-muted">{i.variant}</span> : null}
                  <span className="mt-1 text-sm font-semibold text-brand">{money(i.price, currencySymbol)}</span>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-black/10">
                      <button onClick={() => updateQty(i.productId, i.quantity - 1, i.variant)} className="p-2 hover:text-brand" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-9 text-center text-sm">{i.quantity}</span>
                      <button onClick={() => updateQty(i.productId, i.quantity + 1, i.variant)} className="p-2 hover:text-brand" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <span className="font-semibold">{money(i.price * i.quantity, currencySymbol)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/products" className="btn-ghost btn-md mt-4">← Continue shopping</Link>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h2 className="font-serif text-xl font-semibold">Order Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-medium">{money(subtotal, currencySymbol)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Delivery</span><span className="text-muted">Calculated at checkout</span></div>
              <div className="border-t border-black/5 pt-3 text-xs text-muted">{freeDeliveryText}</div>
            </div>
            <Link href="/checkout" className="btn-primary btn-lg mt-6 w-full">Proceed to Checkout <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
