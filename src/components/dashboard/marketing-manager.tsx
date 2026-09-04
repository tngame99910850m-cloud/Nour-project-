"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, Star } from "lucide-react";
import { toast } from "sonner";
import { saveBanner, deleteBanner, saveTestimonial, deleteTestimonial } from "@/app/admin/marketing/actions";

interface Banner { id: string; title: string; subtitle: string | null; image: string | null; ctaText: string | null; ctaLink: string | null; isActive: boolean; sortOrder: number; }
interface Testimonial { id: string; name: string; text: string; rating: number; isActive: boolean; sortOrder: number; }

export function MarketingManager({ banners, testimonials }: { banners: Banner[]; testimonials: Testimonial[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <BannerSection banners={banners} />
      <TestimonialSection testimonials={testimonials} />
    </div>
  );
}

function BannerSection({ banners }: { banners: Banner[] }) {
  const [editing, setEditing] = useState<Banner | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="card p-5">
      <h2 className="mb-4 font-semibold">Homepage Banners</h2>
      <div className="space-y-2">
        {banners.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-xl border border-black/5 p-3">
            <div>
              <p className="font-medium">{b.title} {!b.isActive ? <span className="badge bg-gray-100 text-gray-600">Off</span> : null}</p>
              {b.subtitle ? <p className="text-xs text-muted">{b.subtitle}</p> : null}
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(b); setCreating(false); }} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-brand"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => { if (confirm("Delete banner?")) start(async () => { await deleteBanner(b.id); toast.success("Deleted"); }); }} disabled={pending} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {creating || editing ? (
        <form action={(fd) => start(async () => { await saveBanner(fd); toast.success("Saved"); setEditing(null); setCreating(false); })} className="mt-4 space-y-2 border-t border-black/5 pt-4">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <input name="title" required defaultValue={editing?.title} placeholder="Title" className="input" />
          <input name="subtitle" defaultValue={editing?.subtitle ?? ""} placeholder="Subtitle" className="input" />
          <input name="image" defaultValue={editing?.image ?? ""} placeholder="Image URL" className="input" />
          <div className="grid grid-cols-2 gap-2">
            <input name="ctaText" defaultValue={editing?.ctaText ?? ""} placeholder="Button text" className="input" />
            <input name="ctaLink" defaultValue={editing?.ctaLink ?? ""} placeholder="Button link" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} placeholder="Order" className="input" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={editing ? editing.isActive : true} className="accent-brand" /> Active</label>
          </div>
          <div className="flex gap-2"><button type="submit" disabled={pending} className="btn-primary btn-sm">Save</button><button type="button" onClick={() => { setEditing(null); setCreating(false); }} className="btn-ghost btn-sm">Cancel</button></div>
        </form>
      ) : (
        <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-outline btn-sm mt-3"><Plus className="h-4 w-4" /> Add banner</button>
      )}
    </div>
  );
}

function TestimonialSection({ testimonials }: { testimonials: Testimonial[] }) {
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="card p-5">
      <h2 className="mb-4 font-semibold">Testimonials</h2>
      <div className="space-y-2">
        {testimonials.map((t) => (
          <div key={t.id} className="flex items-start justify-between rounded-xl border border-black/5 p-3">
            <div>
              <p className="flex items-center gap-1 font-medium">{t.name} <span className="flex text-accent">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}</span></p>
              <p className="line-clamp-2 text-xs text-muted">{t.text}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(t); setCreating(false); }} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-brand"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => { if (confirm("Delete testimonial?")) start(async () => { await deleteTestimonial(t.id); toast.success("Deleted"); }); }} disabled={pending} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {creating || editing ? (
        <form action={(fd) => start(async () => { await saveTestimonial(fd); toast.success("Saved"); setEditing(null); setCreating(false); })} className="mt-4 space-y-2 border-t border-black/5 pt-4">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <input name="name" required defaultValue={editing?.name} placeholder="Customer name" className="input" />
          <textarea name="text" required defaultValue={editing?.text} rows={3} placeholder="Testimonial text" className="input" />
          <div className="grid grid-cols-3 gap-2">
            <select name="rating" defaultValue={editing?.rating ?? 5} className="input">{[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} ★</option>)}</select>
            <input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} placeholder="Order" className="input" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={editing ? editing.isActive : true} className="accent-brand" /> Active</label>
          </div>
          <div className="flex gap-2"><button type="submit" disabled={pending} className="btn-primary btn-sm">Save</button><button type="button" onClick={() => { setEditing(null); setCreating(false); }} className="btn-ghost btn-sm">Cancel</button></div>
        </form>
      ) : (
        <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-outline btn-sm mt-3"><Plus className="h-4 w-4" /> Add testimonial</button>
      )}
    </div>
  );
}
