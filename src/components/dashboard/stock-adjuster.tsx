"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { adjustStock } from "@/app/admin/products/actions";

export function StockAdjuster({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState("");
  const [type, setType] = useState("RECEIVED");
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();

  const submit = () => {
    const n = parseInt(qty, 10);
    if (Number.isNaN(n) || n === 0) return toast.error("Enter a non-zero quantity");
    // For SALE/DAMAGED, quantity is a reduction
    const signed = ["SALE", "DAMAGED"].includes(type) ? -Math.abs(n) : n;
    start(async () => {
      await adjustStock(productId, signed, type, reason || "Manual adjustment");
      toast.success("Stock updated");
      setOpen(false);
      setQty("");
      setReason("");
    });
  };

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-outline btn-sm">Adjust</button>;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-black/10 px-2 py-1.5 text-xs">
        <option value="RECEIVED">Received (+)</option>
        <option value="RETURN">Return (+)</option>
        <option value="ADJUSTMENT">Adjustment (+)</option>
        <option value="SALE">Sale (−)</option>
        <option value="DAMAGED">Damaged (−)</option>
        <option value="CORRECTION">Correction (±)</option>
      </select>
      <input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="Qty" className="w-16 rounded-lg border border-black/10 px-2 py-1.5 text-xs" />
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="w-24 rounded-lg border border-black/10 px-2 py-1.5 text-xs" />
      <button onClick={submit} disabled={pending} className="btn-primary btn-sm">Save</button>
      <button onClick={() => setOpen(false)} className="btn-ghost btn-sm">Cancel</button>
    </div>
  );
}
