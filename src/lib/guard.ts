import "server-only";
import { redirect } from "next/navigation";
import { getSession, canAccessBusinessDashboard, canAccessDeveloperDashboard } from "./auth";
import type { SessionPayload } from "./auth";

export async function requireBusinessAccess(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (!canAccessBusinessDashboard(session.role)) redirect("/login?error=forbidden");
  return session;
}

export async function requireDeveloperAccess(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login?next=/developer");
  if (!canAccessDeveloperDashboard(session.role)) redirect("/admin?error=forbidden");
  return session;
}

/** For write actions that only OWNER/ADMIN may perform. */
export async function requireAdminAccess(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (!["OWNER", "ADMIN", "DEVELOPER"].includes(session.role)) redirect("/admin?error=forbidden");
  return session;
}
