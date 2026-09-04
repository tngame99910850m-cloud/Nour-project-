"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";

export interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDesc: string;
  price: number;
  salePrice: number | null;
  cost: number | null;
  images: string[];
  stock: number;
  lowStockLevel: number;
  categoryId: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary btn-md">
      {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : label}
    </button>
  );
}

export function ProductForm({
  action,
  categories,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  categories: { id: string; name: string; group: string }[];
  initial?: Partial<ProductFormData>;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="card p-6">
          <h2 className="mb-4 font-semibold">Product details</h2>
          <div className="grid gap-4">
            <div>
              <label className="label">Name *</label>
              <input
                name="name" required value={name}
                onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }}
                className="input"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Slug (URL) *</label>
                <input name="slug" required value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} className="input" />
                <p className="mt-1 text-xs text-muted">/products/{slug || "…"}</p>
              </div>
              <div>
                <label className="label">SKU *</label>
                <input name="sku" required defaultValue={initial?.sku} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Short description</label>
              <input name="shortDesc" defaultValue={initial?.shortDesc} className="input" placeholder="One-line summary" />
            </div>
            <div>
              <label className="label">Full description</label>
              <textarea name="description" rows={5} defaultValue={initial?.description} className="input" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold">Pricing & stock</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Price *</label><input name="price" type="number" step="0.01" required defaultValue={initial?.price} className="input" /></div>
            <div><label className="label">Sale price</label><input name="salePrice" type="number" step="0.01" defaultValue={initial?.salePrice ?? ""} className="input" /></div>
            <div><label className="label">Cost (internal)</label><input name="cost" type="number" step="0.01" defaultValue={initial?.cost ?? ""} className="input" /></div>
            <div><label className="label">Stock quantity</label><input name="stock" type="number" defaultValue={initial?.stock ?? 0} className="input" /></div>
            <div><label className="label">Low-stock threshold</label><input name="lowStockLevel" type="number" defaultValue={initial?.lowStockLevel ?? 5} className="input" /></div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold">Media & tags</h2>
          <div>
            <label className="label">Image URLs (one per line)</label>
            <textarea name="images" rows={3} defaultValue={initial?.images?.join("\n")} className="input" placeholder="https://…" />
            <p className="mt-1 text-xs text-muted">Paste image URLs. You can use any hosted image (Unsplash, Cloudinary, Vercel Blob…).</p>
          </div>
          <div className="mt-4">
            <label className="label">Tags (comma separated)</label>
            <input name="tags" defaultValue={initial?.tags?.join(", ")} className="input" placeholder="roses, gold, gift" />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold">SEO</h2>
          <div className="grid gap-4">
            <div><label className="label">Meta title</label><input name="metaTitle" defaultValue={initial?.metaTitle} className="input" /></div>
            <div><label className="label">Meta description</label><textarea name="metaDescription" rows={2} defaultValue={initial?.metaDescription} className="input" /></div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="mb-4 font-semibold">Organization</h2>
          <label className="label">Category *</label>
          <select name="categoryId" required defaultValue={initial?.categoryId} className="input">
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.group} — {c.name}</option>
            ))}
          </select>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold">Visibility</h2>
          <div className="space-y-3 text-sm">
            <Toggle name="isAvailable" label="Available for sale" defaultChecked={initial?.isAvailable ?? true} />
            <Toggle name="isFeatured" label="Featured" defaultChecked={initial?.isFeatured} />
            <Toggle name="isBestSeller" label="Best seller" defaultChecked={initial?.isBestSeller} />
            <Toggle name="isNew" label="New arrival" defaultChecked={initial?.isNew} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SaveButton label={submitLabel} />
        </div>
      </div>
    </form>
  );
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between">
      <span>{label}</span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-5 w-5 accent-brand" />
    </label>
  );
}
