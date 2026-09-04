"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { money } from "@/lib/format";

export function CartDrawer({ currencySymbol }: { currencySymbol: string }) {
  const { items, isOpen, closeCart, updateQty, removeItem, subtotal, count } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
            <ShoppingBag className="h-5 w-5 text-brand" /> Your Cart ({count})
          </h2>
          <button onClick={closeCart} aria-label="Close cart" className="rounded-full p-2 hover:bg-black/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted">
              <ShoppingBag className="mb-3 h-12 w-12 opacity-30" />
              <p className="font-medium">Your cart is empty</p>
              <p className="mt-1 text-sm">Add something beautiful to get started.</p>
              <button onClick={closeCart} className="btn-outline btn-md mt-5">
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={`${i.productId}-${i.variant ?? ""}`} className="flex gap-3">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-canvas">
                    {i.image ? (
                      <Image src={i.image} alt={i.name} fill sizes="80px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/products/${i.slug}`}
                      onClick={closeCart}
                      className="line-clamp-2 text-sm font-medium hover:text-brand"
                    >
                      {i.name}
                    </Link>
                    {i.variant ? <span className="text-xs text-muted">{i.variant}</span> : null}
                    <span className="mt-0.5 text-sm font-semibold text-brand">
                      {money(i.price, currencySymbol)}
                    </span>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-black/10">
                        <button
                          onClick={() => updateQty(i.productId, i.quantity - 1, i.variant)}
                          className="p-1.5 hover:text-brand"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{i.quantity}</span>
                        <button
                          onClick={() => updateQty(i.productId, i.quantity + 1, i.variant)}
                          className="p-1.5 hover:text-brand"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(i.productId, i.variant)}
                        className="p-1.5 text-muted hover:text-red-500"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-black/5 px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="text-lg font-semibold">{money(subtotal, currencySymbol)}</span>
            </div>
            <p className="mb-3 text-xs text-muted">Delivery calculated at checkout.</p>
            <Link href="/checkout" onClick={closeCart} className="btn-primary btn-lg w-full">
              Proceed to Checkout
            </Link>
            <button onClick={closeCart} className="btn-ghost btn-md mt-2 w-full">
              Continue shopping
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
}
