"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireDeveloperAccess } from "@/lib/guard";
import { hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import type { Role } from "@prisma/client";

const VALID_ROLES: Role[] = ["OWNER", "ADMIN", "STAFF", "DEVELOPER"];

export async function createUser(formData: FormData) {
  const session = await requireDeveloperAccess();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "STAFF") as Role;

  if (!email || !name || password.length < 8) throw new Error("Name, email and an 8+ char password are required.");
  if (!VALID_ROLES.includes(role)) throw new Error("Invalid role");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("A user with that email already exists.");

  const user = await prisma.user.create({
    data: { email, name, role, passwordHash: await hashPassword(password) },
  });
  await logAudit(session, { action: "user.create", entity: "User", entityId: user.id, summary: `Created ${role} user ${email}` });
  revalidatePath("/developer/users");
}

export async function updateUserRole(userId: string, role: Role) {
  const session = await requireDeveloperAccess();
  if (!VALID_ROLES.includes(role)) throw new Error("Invalid role");
  const before = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true } });
  await prisma.user.update({ where: { id: userId }, data: { role } });
  await logAudit(session, { action: "user.role", entity: "User", entityId: userId, summary: `Changed role of ${before?.email} to ${role}`, before: { role: before?.role }, after: { role } });
  revalidatePath("/developer/users");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const session = await requireDeveloperAccess();
  if (userId === session.userId) throw new Error("You cannot deactivate your own account.");
  await prisma.user.update({ where: { id: userId }, data: { isActive } });
  await logAudit(session, { action: "user.active", entity: "User", entityId: userId, summary: `${isActive ? "Activated" : "Deactivated"} a user` });
  revalidatePath("/developer/users");
}

export async function resetUserPassword(userId: string, password: string) {
  const session = await requireDeveloperAccess();
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(password) } });
  await logAudit(session, { action: "user.password", entity: "User", entityId: userId, summary: "Reset a user password" });
  revalidatePath("/developer/users");
}

export async function deleteUser(userId: string) {
  const session = await requireDeveloperAccess();
  if (userId === session.userId) throw new Error("You cannot delete your own account.");
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  await prisma.user.delete({ where: { id: userId } });
  await logAudit(session, { action: "user.delete", entity: "User", entityId: userId, summary: `Deleted user ${u?.email}` });
  revalidatePath("/developer/users");
}
