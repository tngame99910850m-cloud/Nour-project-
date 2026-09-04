import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session-edge";

const DEV_ROLES = ["OWNER", "DEVELOPER"];
const BUSINESS_ROLES = ["OWNER", "ADMIN", "STAFF", "DEVELOPER"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdmin = pathname.startsWith("/admin");
  const isDeveloper = pathname.startsWith("/developer");

  if (!isAdmin && !isDeveloper) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isDeveloper && !DEV_ROLES.includes(session.role)) {
    return NextResponse.redirect(new URL("/admin?error=forbidden", req.url));
  }

  if (isAdmin && !BUSINESS_ROLES.includes(session.role)) {
    return NextResponse.redirect(new URL("/login?error=forbidden", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/developer/:path*"],
};
