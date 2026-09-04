"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, Ticket } from "lucide-react";
import { toast } from "sonner";
import { money } from "@/lib/format";
import { saveDiscount, deleteDiscount } from "@/app/admin/discounts/actions";

interface Discount {
  id: string; code: string; type: string; value: number; minOrder: number | null;
  maxUses: number | null; usedCount: number; expiresAt: string | null; isActive: boolean;
}

export function DiscountManager({ discounts, currencySymbol }: { discounts: Discount[]; currencySymbol: string }) {
  const [editing, setEditing] = useState<Discount | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();
  const cur = currencySymbol;

  const onDelete = (id: string) => {
    if (!confirm("Delete this code?")) return;
    start(async () => { await deleteDiscount(id); toast.success("Deleted"); });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {discounts.map((d) => (
          <div key={d.id} className="card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent"><Ticket className="h-5 w-5" /></div>
              <div>
                <p className="font-mono font-semibold">{d.code} {!d.isActive ? <span className="badge bg-gray-100 text-gray-600">Off</span> : null}</p>
                <p className="text-xs text-muted">
                  {d.type === "PERCENTAGE" ? `${d.value}% off` : `${money(d.value, cur)} off`}
                  {d.minOrder ? ` · min ${money(d.minOrder, cur)}` : ""}
                  {d.maxUses ? ` · ${d.usedCount}/${d.maxUses} used` : ` · ${d.usedCount} used`}
                  {d.expiresAt ? ` · expires ${d.expiresAt}` : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(d); setCreating(false); }} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-brand"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => onDelete(d.id)} disabled={pending} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {discounts.length === 0 ? <p className="text-sm text-muted">No discount codes yet.</p> : null}
        <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-outline btn-md"><Plus className="h-4 w-4" /> Add code</button>
      </div>

      {creating || editing ? (
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">{editing ? "Edit code" : "New code"}</h3>
          <form action={(fd) => start(async () => { await saveDiscount(fd); toast.success("Saved"); setEditing(null); setCreating(false); })} className="space-y-3">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <div><label className="label">Code</label><input name="code" required defaultValue={editing?.code} className="input font-mono uppercase" placeholder="WELCOME10" /></div>
            <div><label className="label">Type</label>
              <select name="type" defaultValue={editing?.type ?? "PERCENTAGE"} className="input">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed amount ({cur})</option>
              </select>
            </div>
            <div><label className="label">Value</label><input name="value" type="number" step="0.01" required defaultValue={editing?.value} className="input" /></div>
            <div><label className="label">Minimum order (optional)</label><input name="minOrder" type="number" step="0.01" defaultValue={editing?.minOrder ?? ""} className="input" /></div>
            <div><label className="label">Max uses (optional)</label><input name="maxUses" type="number" defaultValue={editing?.maxUses ?? ""} className="input" /></div>
            <div><label className="label">Expires (optional)</label><input name="expiresAt" type="date" defaultValue={editing?.expiresAt ?? ""} className="input" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={editing ? editing.isActive : true} className="accent-brand" /> Active</label>
            <div className="flex gap-2"><button type="submit" disabled={pending} className="btn-primary btn-md">Save</button><button type="button" onClick={() => { setEditing(null); setCreating(false); }} className="btn-ghost btn-md">Cancel</button></div>
          </form>
        </div>
      ) : (
        <div className="card p-5 text-sm text-muted">Create percentage or fixed-amount codes. Customers enter them at checkout.</div>
      )}
    </div>
  );
}
