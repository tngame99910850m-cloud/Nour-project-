"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveCustomerNote } from "@/app/admin/customers/actions";

export function CustomerNote({ customerId, initial }: { customerId: string; initial: string }) {
  const [note, setNote] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="input" placeholder="Notes about this customer…" />
      <button onClick={() => start(async () => { await saveCustomerNote(customerId, note); toast.success("Saved"); })} disabled={pending} className="btn-dark btn-sm mt-2">Save note</button>
    </div>
  );
}
