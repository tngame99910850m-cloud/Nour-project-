import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { toNumber, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orders";
import { Card, StatCard } from "@/components/dashboard/ui";
import { whatsappLink } from "@/lib/whatsapp";
import { CustomerNote } from "@/components/dashboard/customer-note";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [customer, business] = await Promise.all([
    prisma.customer.findUnique({ where: { id }, include: { orders: { orderBy: { createdAt: "desc" } } } }),
    getBusinessSettings(),
  ]);
  if (!customer) notFound();
  const cur = business.currencySymbol;

  const valid = customer.orders.filter((o) => o.status !== "CANCELLED");
  const spent = valid.reduce((s, o) => s + toNumber(o.total), 0);

  return (
    <div>
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <h1 className="font-serif text-2xl font-semibold">{customer.name}</h1>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-muted"><Phone className="h-4 w-4" /> {customer.phone}</p>
              {customer.email ? <p className="flex items-center gap-2 text-muted"><Mail className="h-4 w-4" /> {customer.email}</p> : null}
              {customer.address ? <p className="flex items-start gap-2 text-muted"><MapPin className="mt-0.5 h-4 w-4" /> {customer.address}{customer.city ? `, ${customer.city}` : ""}</p> : null}
            </div>
            <a href={whatsappLink(customer.phone)} target="_blank" rel="noopener noreferrer" className="btn mt-4 w-full gap-2 bg-green-500 py-2.5 text-white hover:bg-green-600">
              <MessageCircle className="h-4 w-4" /> Message on WhatsApp
            </a>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Orders" value={customer.orders.length} accent="brand" />
            <StatCard label="Total spent" value={money(spent, cur)} accent="green" />
          </div>

          <Card>
            <h2 className="mb-2 font-semibold">Customer note</h2>
            <CustomerNote customerId={customer.id} initial={customer.notes ?? ""} />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-semibold">Order history</h2>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="text-left text-xs uppercase text-muted">
                  <tr><th className="pb-2">Order</th><th className="pb-2">Date</th><th className="pb-2">Status</th><th className="pb-2 text-right">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {customer.orders.map((o) => (
                    <tr key={o.id} className="hover:bg-canvas/40">
                      <td className="py-2.5"><Link href={`/admin/orders/${o.id}`} className="font-medium text-brand hover:underline">{o.orderNumber}</Link></td>
                      <td className="py-2.5 text-muted">{formatDate(o.createdAt)}</td>
                      <td className="py-2.5"><span className={`badge ${ORDER_STATUS_COLORS[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span></td>
                      <td className="py-2.5 text-right font-medium">{money(toNumber(o.total), cur)}</td>
                    </tr>
                  ))}
                  {customer.orders.length === 0 ? <tr><td colSpan={4} className="py-8 text-center text-muted">No orders yet.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
