"use client";

import type { AnalyticsEventType } from "./analytics";

/** Fire-and-forget client-side analytics beacon. */
export function track(type: AnalyticsEventType, data: { path?: string; productId?: string } = {}) {
  try {
    const payload = JSON.stringify({ type, ...data });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {
    /* never throw */
  }
}
