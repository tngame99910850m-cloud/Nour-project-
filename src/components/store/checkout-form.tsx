"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/track-client";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Tag } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { money } from "@/lib/format";
import { placeOrder, validateDiscount } from "@/app/(store)/checkout/actions";

interface Zone {
  id: string;
  name: string;
  fee: number;
  freeThreshold: number | null;
  estimatedTime: string | null;
}

export function CheckoutForm({
  currencySymbol,
  zones,
  discountEnabled,
}: {
  currencySymbol: string;
  zones: Zone[];
  discountEnabled: boolean;
}) {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const cur = currencySymbol;

  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (items.length > 0) track("checkout_started");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zone = useMemo(() => zones.find((z) => z.id === zoneId), [zones, zoneId]);
  const deliveryFee = useMemo(() => {
    if (!zone) return 0;
    if (zone.freeThreshold != null && subtotal >= zone.freeThreshold) return 0;
    return zone.fee;
  }, [zone, subtotal]);

  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  const applyDiscount = async () => {
    const res = await validateDiscount(discountCode, subtotal);
    if (res.ok && res.amount != null) {
      setDiscountAmount(res.amount);
      setDiscountApplied(true);
      toast.success(res.message);
    } else {
      setDiscountAmount(0);
      setDiscountApplied(false);
      toast.error(res.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="font-serif text-2xl">Your cart is empty</p>
        <button onClick={() => router.push("/products")} className="btn-primary btn-md mt-6">Shop Now</button>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: String(form.get("customerName") || ""),
      customerPhone: String(form.get("customerPhone") || ""),
      customerEmail: String(form.get("customerEmail") || ""),
      addressCity: String(form.get("addressCity") || ""),
      addressArea: String(form.get("addressArea") || ""),
      addressStreet: String(form.get("addressStreet") || ""),
      addressBuilding: String(form.get("addressBuilding") || ""),
      addressNotes: String(form.get("addressNotes") || ""),
      deliveryDate: String(form.get("deliveryDate") || ""),
      deliveryTime: String(form.get("deliveryTime") || ""),
      orderNotes: String(form.get("orderNotes") || ""),
      deliveryZoneId: zoneId,
      discountCode: discountApplied ? discountCode : "",
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, variant: i.variant })),
    };

    const res = await placeOrder(payload);
    if (res.ok && res.orderNumber) {
      clear();
      router.push(`/order-confirmation/${res.orderNumber}`);
    } else {
      setErrors(res.fieldErrors || {});
      toast.error(res.error || "Could not place order");
      setSubmitting(false);
    }
  };

  const err = (k: string) => errors[k] ? <p className="mt-1 text-xs text-red-500">{errors[k]}</p> : null;

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Contact */}
        <section className="card p-6">
          <h2 className="mb-4 font-serif text-xl font-semibold">Contact details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full name *</label>
              <input name="customerName" required className="input" placeholder="Your name" />
              {err("customerName")}
            </div>
            <div>
              <label className="label">Phone number *</label>
              <input name="customerPhone" required className="input" placeholder="+971 5x xxx xxxx" />
              {err("customerPhone")}
            </div>
            <div className="sm:col-span-2">
              <label className="label">Email (optional)</label>
              <input name="customerEmail" type="email" className="input" placeholder="you@example.com" />
              {err("customerEmail")}
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section className="card p-6">
          <h2 className="mb-4 font-serif text-xl font-semibold">Delivery information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Delivery zone *</label>
              <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="input" required>
                <option value="">Select a zone</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} — {z.fee === 0 ? "Free" : money(z.fee, cur)}{z.estimatedTime ? ` · ${z.estimatedTime}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Area / City</label>
              <input name="addressCity" className="input" placeholder="Dubai" />
            </div>
            <div>
              <label className="label">Neighbourhood / Area</label>
              <input name="addressArea" className="input" placeholder="Jumeirah" />
            </div>
            <div>
              <label className="label">Street</label>
              <input name="addressStreet" className="input" placeholder="Al Wasl Road" />
            </div>
            <div>
              <label className="label">Building / Villa</label>
              <input name="addressBuilding" className="input" placeholder="Villa 12" />
            </div>
            <div>
              <label className="label">Additional instructions</label>
              <input name="addressNotes" className="input" placeholder="Gate code, landmark…" />
            </div>
            <div>
              <label className="label">Preferred delivery date</label>
              <input name="deliveryDate" type="date" className="input" />
            </div>
            <div>
              <label className="label">Preferred time</label>
              <select name="deliveryTime" className="input">
                <option value="">Any time</option>
                <option>Morning (9am–12pm)</option>
                <option>Afternoon (12pm–4pm)</option>
                <option>Evening (4pm–9pm)</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Order notes (optional)</label>
            <textarea name="orderNotes" rows={3} className="input" placeholder="Any special requests…" />
          </div>
        </section>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="card sticky top-24 p-6">
          <h2 className="font-serif text-xl font-semibold">Your order</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={`${i.productId}-${i.variant ?? ""}`} className="flex gap-3">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-canvas">
                  {i.image ? <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" /> : null}
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-white">{i.quantity}</span>
                </div>
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 font-medium">{i.name}</p>
                  {i.variant ? <p className="text-xs text-muted">{i.variant}</p> : null}
                  <p className="text-brand">{money(i.price * i.quantity, cur)}</p>
                </div>
              </li>
            ))}
          </ul>

          {discountEnabled ? (
            <div className="mt-5">
              <label className="label">Discount code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} className="input pl-9" placeholder="e.g. WELCOME10" />
                </div>
                <button type="button" onClick={applyDiscount} className="btn-dark btn-md">Apply</button>
              </div>
            </div>
          ) : null}

          <div className="mt-5 space-y-2 border-t border-black/5 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(subtotal, cur)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{deliveryFee === 0 ? "Free" : money(deliveryFee, cur)}</span></div>
            {discountAmount > 0 ? <div className="flex justify-between text-green-600"><span>Discount</span><span>−{money(discountAmount, cur)}</span></div> : null}
            <div className="flex justify-between border-t border-black/5 pt-2 text-base font-semibold"><span>Total</span><span className="text-brand">{money(total, cur)}</span></div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary btn-lg mt-6 w-full">
            {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Placing order…</> : "Place Order"}
          </button>
          <p className="mt-3 text-center text-xs text-muted">You&apos;ll receive an order confirmation. Payment on delivery.</p>
        </div>
      </div>
    </form>
  );
}
