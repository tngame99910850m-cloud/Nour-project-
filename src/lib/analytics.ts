import { prisma } from "./prisma";

export type AnalyticsEventType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "order_placed";

export async function trackEvent(
  type: AnalyticsEventType,
  opts: { path?: string; productId?: string; metadata?: Record<string, unknown> } = {},
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        type,
        path: opts.path,
        productId: opts.productId,
        metadata: opts.metadata as any,
      },
    });
  } catch {
    // analytics must never break the request
  }
}
