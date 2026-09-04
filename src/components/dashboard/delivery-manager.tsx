"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, MapPin, Truck, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { money } from "@/lib/format";
import { saveZone, deleteZone, savePartner, deletePartner } from "@/app/admin/delivery/actions";

interface Zone { id: string; name: string; fee: number; freeThreshold: number | null; estimatedTime: string | null; isActive: boolean; }
interface Partner { id: string; companyName: string; contactPerson: string | null; phone: string | null; email: string | null; whatsapp: string | null; pricing: string | null; serviceAreas: string | null; notes: string | null; isActive: boolean; }

export function DeliveryManager({ zones, partners, currencySymbol }: { zones: Zone[]; partners: Partner[]; currencySymbol: string }) {
  const [tab, setTab] = useState<"zones" | "partners">("zones");

  return (
    <div>
      <div className="mb-6 inline-flex rounded-full bg-white p-1 shadow-soft">
        <button onClick={() => setTab("zones")} className={`rounded-full px-5 py-2 text-sm font-medium ${tab === "zones" ? "bg-brand text-white" : "text-ink"}`}>Delivery Zones</button>
        <button onClick={() => setTab("partners")} className={`rounded-full px-5 py-2 text-sm font-medium ${tab === "partners" ? "bg-brand text-white" : "text-ink"}`}>Delivery Partners</button>
      </div>

      {tab === "zones" ? <ZonesTab zones={zones} cur={currencySymbol} /> : <PartnersTab partners={partners} />}
    </div>
  );
}

function ZonesTab({ zones, cur }: { zones: Zone[]; cur: string }) {
  const [editing, setEditing] = useState<Zone | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();

  const onDelete = (id: string) => {
    if (!confirm("Delete this zone?")) return;
    start(async () => { await deleteZone(id); toast.success("Zone deleted"); });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {zones.map((z) => (
          <div key={z.id} className="card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand"><MapPin className="h-5 w-5" /></div>
              <div>
                <p className="font-medium">{z.name} {!z.isActive ? <span className="badge bg-gray-100 text-gray-600">Off</span> : null}</p>
                <p className="text-xs text-muted">Fee: {money(z.fee, cur)}{z.freeThreshold ? ` · Free over ${money(z.freeThreshold, cur)}` : ""}{z.estimatedTime ? ` · ${z.estimatedTime}` : ""}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(z); setCreating(false); }} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-brand"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => onDelete(z.id)} disabled={pending} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {zones.length === 0 ? <p className="text-sm text-muted">No delivery zones yet.</p> : null}
        <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-outline btn-md"><Plus className="h-4 w-4" /> Add zone</button>
      </div>

      {creating || editing ? (
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">{editing ? "Edit zone" : "New zone"}</h3>
          <form action={(fd) => start(async () => { await saveZone(fd); toast.success("Saved"); setEditing(null); setCreating(false); })} className="space-y-3">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <div><label className="label">Zone name</label><input name="name" required defaultValue={editing?.name} className="input" placeholder="e.g. Dubai — City" /></div>
            <div><label className="label">Delivery fee ({cur})</label><input name="fee" type="number" step="0.01" required defaultValue={editing?.fee} className="input" /></div>
            <div><label className="label">Free delivery threshold (optional)</label><input name="freeThreshold" type="number" step="0.01" defaultValue={editing?.freeThreshold ?? ""} className="input" /></div>
            <div><label className="label">Estimated time</label><input name="estimatedTime" defaultValue={editing?.estimatedTime ?? ""} className="input" placeholder="Same day" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={editing ? editing.isActive : true} className="accent-brand" /> Active</label>
            <div className="flex gap-2"><button type="submit" disabled={pending} className="btn-primary btn-md">Save</button><button type="button" onClick={() => { setEditing(null); setCreating(false); }} className="btn-ghost btn-md">Cancel</button></div>
          </form>
        </div>
      ) : (
        <div className="card p-5 text-sm text-muted">Select a zone to edit, or add a new one. Zones and their fees appear at checkout.</div>
      )}
    </div>
  );
}

function PartnersTab({ partners }: { partners: Partner[] }) {
  const [editing, setEditing] = useState<Partner | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();

  const onDelete = (id: string) => {
    if (!confirm("Delete this partner?")) return;
    start(async () => { await deletePartner(id); toast.success("Partner deleted"); });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {partners.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/10 text-ink"><Truck className="h-5 w-5" /></div>
                <div>
                  <p className="font-medium">{p.companyName} {!p.isActive ? <span className="badge bg-gray-100 text-gray-600">Off</span> : null}</p>
                  {p.contactPerson ? <p className="text-xs text-muted">{p.contactPerson}</p> : null}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(p); setCreating(false); }} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-brand"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => onDelete(p.id)} disabled={pending} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              {p.phone ? <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {p.phone}</span> : null}
              {p.email ? <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {p.email}</span> : null}
              {p.serviceAreas ? <span>Areas: {p.serviceAreas}</span> : null}
              {p.pricing ? <span>Pricing: {p.pricing}</span> : null}
            </div>
          </div>
        ))}
        {partners.length === 0 ? <p className="text-sm text-muted">No delivery partners yet.</p> : null}
        <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-outline btn-md"><Plus className="h-4 w-4" /> Add partner</button>
      </div>

      {creating || editing ? (
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">{editing ? "Edit partner" : "New partner"}</h3>
          <form action={(fd) => start(async () => { await savePartner(fd); toast.success("Saved"); setEditing(null); setCreating(false); })} className="space-y-3">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <div><label className="label">Company name</label><input name="companyName" required defaultValue={editing?.companyName} className="input" /></div>
            <div><label className="label">Contact person</label><input name="contactPerson" defaultValue={editing?.contactPerson ?? ""} className="input" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="label">Phone</label><input name="phone" defaultValue={editing?.phone ?? ""} className="input" /></div>
              <div><label className="label">WhatsApp</label><input name="whatsapp" defaultValue={editing?.whatsapp ?? ""} className="input" /></div>
            </div>
            <div><label className="label">Email</label><input name="email" defaultValue={editing?.email ?? ""} className="input" /></div>
            <div><label className="label">Service areas</label><input name="serviceAreas" defaultValue={editing?.serviceAreas ?? ""} className="input" /></div>
            <div><label className="label">Pricing</label><input name="pricing" defaultValue={editing?.pricing ?? ""} className="input" /></div>
            <div><label className="label">Notes</label><textarea name="notes" rows={2} defaultValue={editing?.notes ?? ""} className="input" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={editing ? editing.isActive : true} className="accent-brand" /> Active</label>
            <div className="flex gap-2"><button type="submit" disabled={pending} className="btn-primary btn-md">Save</button><button type="button" onClick={() => { setEditing(null); setCreating(false); }} className="btn-ghost btn-md">Cancel</button></div>
          </form>
        </div>
      ) : (
        <div className="card p-5 text-sm text-muted">Store any delivery company here — the system is not tied to a specific provider. Assign partners to orders from the order page.</div>
      )}
    </div>
  );
}
