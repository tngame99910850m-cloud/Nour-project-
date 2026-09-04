"use client";

import { useState, useTransition } from "react";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { toast } from "sonner";
import type { HomepageSection } from "@/lib/settings";
import { updateHomepageSections } from "@/app/developer/actions";

export function HomepageBuilder({ initial }: { initial: HomepageSection[] }) {
  const [sections, setSections] = useState(initial);
  const [pending, start] = useTransition();

  const move = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next.map((s, i) => ({ ...s, order: i })));
  };

  const toggle = (key: string) => {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)));
  };

  const save = () => {
    start(async () => {
      await updateHomepageSections(sections.map((s, i) => ({ ...s, order: i })));
      toast.success("Homepage layout saved");
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="card divide-y divide-black/5">
        {sections.map((s, i) => (
          <div key={s.key} className="flex items-center gap-3 p-4">
            <GripVertical className="h-5 w-5 text-muted/40" />
            <div className="flex-1">
              <p className="font-medium">{s.label}</p>
              <p className="font-mono text-xs text-muted">{s.key}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg p-2 text-muted hover:bg-black/5 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
              <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="rounded-lg p-2 text-muted hover:bg-black/5 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
            </div>
            <label className="ml-2 inline-flex cursor-pointer items-center">
              <input type="checkbox" checked={s.enabled} onChange={() => toggle(s.key)} className="h-5 w-5 accent-brand" />
            </label>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={save} disabled={pending} className="btn-primary btn-lg">{pending ? "Saving…" : "Save layout"}</button>
      </div>
    </div>
  );
}
