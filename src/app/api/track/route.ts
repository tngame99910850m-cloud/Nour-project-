import { NextResponse, type NextRequest } from "next/server";
import { trackEvent, type AnalyticsEventType } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const ALLOWED: AnalyticsEventType[] = ["page_view", "product_view", "add_to_cart", "checkout_started", "order_placed"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body?.type as AnalyticsEventType;
    if (!ALLOWED.includes(type)) return NextResponse.json({ ok: false }, { status: 400 });
    await trackEvent(type, {
      path: typeof body.path === "string" ? body.path.slice(0, 300) : undefined,
      productId: typeof body.productId === "string" ? body.productId : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
