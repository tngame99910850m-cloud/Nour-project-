import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { toNumber } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order Confirmed" };

export default async function ConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const [order, business] = await Promise.all([
    prisma.order.findUnique({ where: { orderNumber }, include: { items: true } }),
    getBusinessSettings(),
  ]);

  if (!order) notFound();
  const cur = business.currencySymbol;

  const waMessage = `Hello ${business.name}, I just placed order ${order.orderNumber}. Total: ${money(
    toNumber(order.total),
    cur,
  )}. My name is ${order.customerName}.`;

  return (
    <div className="container-px py-12">
      <div className="mx-auto max-w-2xl">
        <div className="card p-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 font-serif text-3xl font-semibold">Thank you for your order!</h1>
          <p className="mt-2 text-muted">
            Your order <span className="font-semibold text-ink">{order.orderNumber}</span> has been received.
            We&apos;ll contact you shortly to confirm delivery.
          </p>
          <span className="badge mt-4 bg-amber-100 text-amber-800">{ORDER_STATUS_LABELS[order.status]}</span>

          <a
            href={whatsappLink(business.whatsapp, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-6 w-full gap-2 bg-green-500 py-3.5 text-white hover:bg-green-600"
          >
            <MessageCircle className="h-5 w-5" /> Confirm on WhatsApp
          </a>
        </div>

        <div className="card mt-6 p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
            <Package className="h-5 w-5 text-brand" /> Order Details
          </h2>
          <ul className="mt-4 divide-y divide-black/5">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between py-3 text-sm">
                <span>
                  {i.productName} <span className="text-muted">× {i.quantity}</span>
                  {i.variantInfo ? <span className="block text-xs text-muted">{i.variantInfo}</span> : null}
                </span>
                <span className="font-medium">{money(toNumber(i.lineTotal), cur)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-black/5 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(toNumber(order.subtotal), cur)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{toNumber(order.deliveryFee) === 0 ? "Free" : money(toNumber(order.deliveryFee), cur)}</span></div>
            {toNumber(order.discount) > 0 ? <div className="flex justify-between text-green-600"><span>Discount</span><span>−{money(toNumber(order.discount), cur)}</span></div> : null}
            <div className="flex justify-between border-t border-black/5 pt-2 text-base font-semibold"><span>Total</span><span className="text-brand">{money(toNumber(order.total), cur)}</span></div>
          </div>
        </div>

        <div className="card mt-6 p-6 text-sm">
          <h3 className="font-semibold">Delivery to</h3>
          <p className="mt-2 text-muted">
            {order.customerName} · {order.customerPhone}
            <br />
            {[order.addressBuilding, order.addressStreet, order.addressArea, order.addressCity].filter(Boolean).join(", ")}
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/products" className="btn-outline btn-md">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
