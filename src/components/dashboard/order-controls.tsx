"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus, assignDeliveryPartner, updatePaymentStatus, saveInternalNote } from "@/app/admin/orders/actions";
import { ORDER_STATUS_LABELS } from "@/lib/orders";
import type { OrderStatus } from "@prisma/client";

export function OrderControls({
  orderId,
  status,
  paymentStatus,
  partnerId,
  partners,
  internalNotes,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: string;
  partnerId: string | null;
  partners: { id: string; name: string }[];
  internalNotes: string;
}) {
  const [pending, start] = useTransition();
  const [note, setNote] = useState(internalNotes);

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Order status</label>
        <select
          defaultValue={status}
          disabled={pending}
          onChange={(e) =>
            start(async () => {
              await updateOrderStatus(orderId, e.target.value as OrderStatus);
              toast.success("Status updated");
            })
          }
          className="input"
        >
          {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Payment status</label>
        <select
          defaultValue={paymentStatus}
          disabled={pending}
          onChange={(e) =>
            start(async () => {
              await updatePaymentStatus(orderId, e.target.value as any);
              toast.success("Payment updated");
            })
          }
          className="input"
        >
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div>
        <label className="label">Delivery partner</label>
        <select
          defaultValue={partnerId ?? ""}
          disabled={pending}
          onChange={(e) =>
            start(async () => {
              await assignDeliveryPartner(orderId, e.target.value || null);
              toast.success("Delivery partner updated");
            })
          }
          className="input"
        >
          <option value="">Not assigned</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Internal note</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="input" placeholder="Private note for your team…" />
        <button
          disabled={pending}
          onClick={() => start(async () => { await saveInternalNote(orderId, note); toast.success("Note saved"); })}
          className="btn-dark btn-sm mt-2"
        >
          Save note
        </button>
      </div>
    </div>
  );
}
