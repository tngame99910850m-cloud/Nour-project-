"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

export function OrdersToolbar({ current }: { current: { q?: string; status?: string } }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(current.q ?? "");

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "ALL") next.set(key, value);
    else next.delete(key);
    router.push(`/admin/orders?${next.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <form
        onSubmit={(e) => { e.preventDefault(); setParam("q", q); }}
        className="relative flex-1"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order #, name, phone…" className="input pl-10" />
      </form>
      <select
        value={current.status ?? "ALL"}
        onChange={(e) => setParam("status", e.target.value)}
        className="input sm:w-56"
      >
        <option value="ALL">All statuses</option>
        {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  );
}
