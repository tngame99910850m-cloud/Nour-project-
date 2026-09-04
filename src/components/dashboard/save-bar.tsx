"use client";

import { useFormStatus } from "react-dom";

export function SaveBar({ label = "Save changes" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-4 flex justify-end">
      <button type="submit" disabled={pending} className="btn-primary btn-lg shadow-card">
        {pending ? "Saving…" : label}
      </button>
    </div>
  );
}
