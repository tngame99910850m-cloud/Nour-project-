"use server";

import { redirect } from "next/navigation";
import { authenticate, createSession, destroySession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { loginSchema } from "@/lib/validators";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Please enter a valid email and password." };

  const session = await authenticate(parsed.data.email, parsed.data.password);
  if (!session) return { error: "Invalid credentials, or your account is inactive." };

  await createSession(session);
  await logAudit(session, { action: "auth.login", summary: `${session.name} logged in` });

  const next = String(formData.get("next") || "");
  const dest =
    next && (next.startsWith("/admin") || next.startsWith("/developer"))
      ? next
      : session.role === "DEVELOPER"
        ? "/developer"
        : "/admin";
  redirect(dest);
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
