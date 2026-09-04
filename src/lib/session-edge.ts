import { jwtVerify } from "jose";
import type { Role } from "@prisma/client";

// Edge-safe session verification (no bcrypt / no Prisma) for middleware.

export interface EdgeSession {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export async function verifySessionToken(token: string | undefined): Promise<EdgeSession | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as EdgeSession;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "nour_session";
