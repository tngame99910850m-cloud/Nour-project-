import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer, User, MapPin, Phone, Mail, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { toNumber, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orders";
import { Card } from "@/components/dashboard/ui";
import { OrderControls } from "@/components/dashboard/order-controls";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, business, partners] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: { items: true, deliveryZone: true, deliveryPartner: true },
    }),
    getBusinessSettings(),
    prisma.deliveryPartner.findMany({ where: { isActive: true }, orderBy: { companyName: "asc" } }),
  ]);

  if (!order) notFound();
  const cur = business.currencySymbol;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <Link href={`/print/order/${id}`} target="_blank" className="btn-outline btn-sm">
          <Printer className="h-4 w-4" /> Print
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-2xl font-semibold">{order.orderNumber}</h1>
        <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
        <span className={`badge ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{order.paymentStatus}</span>
        <span className="text-sm text-muted">{formatDateTime(order.createdAt)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <Card>
            <h2 className="mb-4 font-semibold">Order items</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr><th className="pb-2">Product</th><th className="pb-2">Price</th><th className="pb-2">Qty</th><th className="pb-2 text-right">Total</th></tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2.5">{i.productName}{i.variantInfo ? <span className="block text-xs text-muted">{i.variantInfo}</span> : null}</td>
                    <td className="py-2.5">{money(toNumber(i.price), cur)}</td>
                    <td className="py-2.5">{i.quantity}</td>
                    <td className="py-2.5 text-right font-medium">{money(toNumber(i.lineTotal), cur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 space-y-1.5 border-t border-black/5 pt-4 text-sm">
              <Row label="Subtotal" value={money(toNumber(order.subtotal), cur)} />
              <Row label="Delivery" value={toNumber(order.deliveryFee) === 0 ? "Free" : money(toNumber(order.deliveryFee), cur)} />
              {toNumber(order.discount) > 0 ? <Row label={`Discount ${order.discountCode ? `(${order.discountCode})` : ""}`} value={`−${money(toNumber(order.discount), cur)}`} /> : null}
              <div className="flex justify-between border-t border-black/5 pt-2 text-base font-semibold"><span>Total</span><span className="text-brand">{money(toNumber(order.total), cur)}</span></div>
            </div>
          </Card>

          {order.orderNotes ? (
            <Card>
              <h2 className="mb-2 font-semibold">Customer note</h2>
              <p className="text-sm text-muted">{order.orderNotes}</p>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          {/* Controls */}
          <Card>
            <h2 className="mb-4 font-semibold">Manage order</h2>
            <OrderControls
              orderId={order.id}
              status={order.status}
              paymentStatus={order.paymentStatus}
              partnerId={order.deliveryPartnerId}
              partners={partners.map((p) => ({ id: p.id, name: p.companyName }))}
              internalNotes={order.internalNotes ?? ""}
            />
          </Card>

          {/* Customer */}
          <Card>
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><User className="h-4 w-4 text-brand" /> Customer</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="flex items-center gap-2 text-muted"><Phone className="h-4 w-4" /> {order.customerPhone}</p>
              {order.customerEmail ? <p className="flex items-center gap-2 text-muted"><Mail className="h-4 w-4" /> {order.customerEmail}</p> : null}
            </div>
          </Card>

          {/* Delivery */}
          <Card>
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-brand" /> Delivery</h2>
            <div className="space-y-1.5 text-sm text-muted">
              <p className="text-ink">{[order.addressBuilding, order.addressStreet].filter(Boolean).join(", ")}</p>
              <p>{[order.addressArea, order.addressCity].filter(Boolean).join(", ")}</p>
              {order.addressNotes ? <p className="italic">{order.addressNotes}</p> : null}
              {order.deliveryZone ? <p className="pt-2">Zone: <span className="text-ink">{order.deliveryZone.name}</span></p> : null}
              {order.deliveryDate ? <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(order.deliveryDate).toLocaleDateString()} {order.deliveryTime}</p> : null}
              {order.deliveryPartner ? <p className="pt-2">Partner: <span className="text-ink">{order.deliveryPartner.companyName}</span></p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted">{label}</span><span>{value}</span></div>;
}
