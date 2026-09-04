"use client";

import { useState, useTransition } from "react";
import { Trash2, Pencil, Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/categories/actions";

interface Cat {
  id: string;
  name: string;
  slug: string;
  group: string;
  parentId: string | null;
  image: string | null;
  isActive: boolean;
  productCount: number;
}

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const parents = categories.filter((c) => !c.parentId);
  return (
    <div className="space-y-4">
      {parents.map((parent) => (
        <div key={parent.id} className="card p-5">
          <CategoryRow cat={parent} isParent />
          <div className="mt-3 space-y-1 border-l-2 border-black/5 pl-4">
            {categories.filter((c) => c.parentId === parent.id).map((sub) => (
              <CategoryRow key={sub.id} cat={sub} />
            ))}
            {categories.filter((c) => c.parentId === parent.id).length === 0 ? (
              <p className="text-xs text-muted">No subcategories</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryRow({ cat, isParent }: { cat: Cat; isParent?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  const onDelete = () => {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    start(async () => {
      try {
        await deleteCategory(cat.id);
        toast.success("Category deleted");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not delete");
      }
    });
  };

  if (editing) {
    return (
      <form
        action={(fd) => start(async () => { await updateCategory(cat.id, fd); toast.success("Saved"); setEditing(false); })}
        className="flex flex-wrap items-center gap-2 py-1"
      >
        <input name="name" defaultValue={cat.name} className="input flex-1 py-1.5" />
        <input name="image" defaultValue={cat.image ?? ""} placeholder="Image URL" className="input flex-1 py-1.5" />
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="isActive" defaultChecked={cat.isActive} className="accent-brand" /> Active</label>
        <button type="submit" disabled={pending} className="rounded-lg p-2 text-green-600 hover:bg-green-50"><Check className="h-4 w-4" /></button>
        <button type="button" onClick={() => setEditing(false)} className="rounded-lg p-2 text-muted hover:bg-black/5"><X className="h-4 w-4" /></button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span className={isParent ? "font-serif text-lg font-semibold" : "text-sm"}>{cat.name}</span>
        {isParent ? <span className="badge bg-brand/10 text-brand">{cat.group}</span> : null}
        <span className="text-xs text-muted">{cat.productCount} products</span>
        {!cat.isActive ? <span className="badge bg-gray-100 text-gray-600">Hidden</span> : null}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setEditing(true)} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-brand"><Pencil className="h-4 w-4" /></button>
        <button onClick={onDelete} disabled={pending} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

export function CategoryAddForm({ parents }: { parents: { id: string; name: string; group: string }[] }) {
  const [pending, start] = useTransition();
  const [isSub, setIsSub] = useState(false);

  return (
    <form
      action={(fd) => start(async () => { await createCategory(fd); toast.success("Category added"); (document.getElementById("cat-form") as HTMLFormElement)?.reset(); })}
      id="cat-form"
      className="space-y-3"
    >
      <div>
        <label className="label">Name</label>
        <input name="name" required className="input" placeholder="e.g. Candles" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isSub} onChange={(e) => setIsSub(e.target.checked)} className="accent-brand" /> This is a subcategory
      </label>
      {isSub ? (
        <div>
          <label className="label">Parent category</label>
          <select name="parentId" className="input">
            {parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      ) : (
        <div>
          <label className="label">Group</label>
          <select name="group" className="input">
            <option value="WEDDING">Wedding</option>
            <option value="HOME">Home</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      )}
      <div>
        <label className="label">Image URL (optional)</label>
        <input name="image" className="input" placeholder="https://…" />
      </div>
      <button type="submit" disabled={pending} className="btn-primary btn-md w-full"><Plus className="h-4 w-4" /> Add Category</button>
    </form>
  );
}
