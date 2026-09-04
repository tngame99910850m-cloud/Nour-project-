import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/guard";
import { getBusinessSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { toNumber, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/orders";
import { PrintTrigger } from "@/components/dashboard/print-trigger";

export const dynamic = "force-dynamic";

export default async function OrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  await requireBusinessAccess();
  const { id } = await params;
  const [order, business] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true, deliveryZone: true } }),
    getBusinessSettings(),
  ]);
  if (!order) notFound();
  const cur = business.currencySymbol;

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 text-sm text-black">
      <PrintTrigger />
      <div className="flex items-start justify-between border-b pb-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">{business.name}</h1>
          <p className="text-gray-500">{business.address}</p>
          <p className="text-gray-500">{business.phone}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">Invoice</p>
          <p className="text-gray-500">{order.orderNumber}</p>
          <p className="text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Bill to</p>
          <p>{order.customerName}</p>
          <p className="text-gray-500">{order.customerPhone}</p>
          {order.customerEmail ? <p className="text-gray-500">{order.customerEmail}</p> : null}
        </div>
        <div>
          <p className="font-semibold">Deliver to</p>
          <p className="text-gray-500">{[order.addressBuilding, order.addressStreet, order.addressArea, order.addressCity].filter(Boolean).join(", ")}</p>
          <p className="text-gray-500">Status: {ORDER_STATUS_LABELS[order.status]}</p>
        </div>
      </div>

      <table className="mt-6 w-full">
        <thead className="border-b text-left">
          <tr><th className="py-2">Item</th><th className="py-2">Price</th><th className="py-2">Qty</th><th className="py-2 text-right">Total</th></tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id} className="border-b">
              <td className="py-2">{i.productName}</td>
              <td className="py-2">{money(toNumber(i.price), cur)}</td>
              <td className="py-2">{i.quantity}</td>
              <td className="py-2 text-right">{money(toNumber(i.lineTotal), cur)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 ml-auto w-56 space-y-1">
        <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{money(toNumber(order.subtotal), cur)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{money(toNumber(order.deliveryFee), cur)}</span></div>
        {toNumber(order.discount) > 0 ? <div className="flex justify-between"><span className="text-gray-500">Discount</span><span>−{money(toNumber(order.discount), cur)}</span></div> : null}
        <div className="flex justify-between border-t pt-1 font-semibold"><span>Total</span><span>{money(toNumber(order.total), cur)}</span></div>
      </div>

      <p className="mt-10 text-center text-gray-400">Thank you for your order!</p>
    </div>
  );
}
