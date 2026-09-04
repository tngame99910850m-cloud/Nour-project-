"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct } from "@/app/admin/products/actions";

export function ProductRowActions({ id, slug }: { id: string; slug: string }) {
  const [pending, start] = useTransition();

  const onDelete = () => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    start(async () => {
      try {
        await deleteProduct(id);
        toast.success("Product deleted");
      } catch {
        toast.error("Could not delete product");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/products/${slug}`} target="_blank" className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-brand" title="View">
        <ExternalLink className="h-4 w-4" />
      </Link>
      <Link href={`/admin/products/${id}`} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-brand" title="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      <button onClick={onDelete} disabled={pending} className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-red-500" title="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
