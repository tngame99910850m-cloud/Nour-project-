"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface Cat {
  name: string;
  slug: string;
  group: string;
  parentId: string | null;
}

export function ProductFilters({
  categories,
  current,
}: {
  categories: Cat[];
  current: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(current.q ?? "");

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/products?${next.toString()}`);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("q", q);
  };

  const parentCats = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="input pl-12 pr-28"
        />
        <button type="submit" className="btn-primary btn-sm absolute right-1.5 top-1/2 -translate-y-1/2">
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-medium text-muted">
          <SlidersHorizontal className="h-4 w-4" /> Filter:
        </span>
        <FilterChip active={!current.group && !current.category && !current.filter} onClick={() => router.push("/products")}>
          All
        </FilterChip>
        <FilterChip active={current.group === "wedding"} onClick={() => setParam("group", current.group === "wedding" ? "" : "wedding")}>
          Wedding
        </FilterChip>
        <FilterChip active={current.group === "home"} onClick={() => setParam("group", current.group === "home" ? "" : "home")}>
          Home
        </FilterChip>
        <FilterChip active={current.filter === "new"} onClick={() => setParam("filter", current.filter === "new" ? "" : "new")}>
          New
        </FilterChip>
        <FilterChip active={current.filter === "sale"} onClick={() => setParam("filter", current.filter === "sale" ? "" : "sale")}>
          On Sale
        </FilterChip>
        <FilterChip active={current.filter === "bestselling"} onClick={() => setParam("filter", current.filter === "bestselling" ? "" : "bestselling")}>
          Best Sellers
        </FilterChip>

        <select
          value={current.sort ?? ""}
          onChange={(e) => setParam("sort", e.target.value)}
          className="ml-auto rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
          <option value="bestselling">Most Popular</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-black/5 pt-3">
        {parentCats.map((parent) => (
          <details key={parent.slug} className="group">
            <summary className="cursor-pointer list-none rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-ink hover:border-brand">
              {parent.name} ▾
            </summary>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {categories
                .filter((c) => c.parentId && c.group === parent.group)
                .map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setParam("category", current.category === c.slug ? "" : c.slug)}
                    className={`rounded-full px-3 py-1 text-xs ${
                      current.category === c.slug ? "bg-brand text-white" : "bg-black/5 text-ink hover:bg-black/10"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active ? "bg-brand text-white" : "bg-black/5 text-ink hover:bg-black/10"
      }`}
    >
      {children}
    </button>
  );
}
