"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export function TableSearch({ placeholder, basePath, initial }: { placeholder: string; basePath: string; initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial ?? "");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); router.push(q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath); }}
      className="relative max-w-md"
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="input pl-10" />
    </form>
  );
}
