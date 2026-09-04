"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@prisma/client";
import { createUser, updateUserRole, toggleUserActive, resetUserPassword, deleteUser } from "@/app/developer/users/actions";

interface U { id: string; name: string; email: string; role: Role; isActive: boolean; lastLoginAt: string | null; }
const ROLES: Role[] = ["OWNER", "ADMIN", "STAFF", "DEVELOPER"];

export function UsersManager({ users, currentUserId }: { users: U[]; currentUserId: string }) {
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();

  const wrap = (fn: () => Promise<void>, ok: string) =>
    start(async () => {
      try { await fn(); toast.success(ok); }
      catch (e) { toast.error(e instanceof Error ? e.message : "Action failed"); }
    });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setCreating((v) => !v)} className="btn-primary btn-md"><Plus className="h-4 w-4" /> Add user</button>
      </div>

      {creating ? (
        <form
          action={(fd) => wrap(async () => { await createUser(fd); setCreating(false); }, "User created")}
          className="card mb-4 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div><label className="label">Name</label><input name="name" required className="input" /></div>
          <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
          <div><label className="label">Password (8+)</label><input name="password" type="text" required className="input" /></div>
          <div>
            <label className="label">Role</label>
            <select name="role" className="input">{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4"><button type="submit" disabled={pending} className="btn-primary btn-md">Create user</button></div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-surface">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last login</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-canvas/50">
                  <td className="px-4 py-3"><div className="font-medium">{u.name}</div><div className="text-xs text-muted">{u.email}</div></td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue={u.role}
                      disabled={pending || u.id === currentUserId}
                      onChange={(e) => wrap(() => updateUserRole(u.id, e.target.value as Role), "Role updated")}
                      className="rounded-lg border border-black/10 px-2 py-1.5 text-xs"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => wrap(() => toggleUserActive(u.id, !u.isActive), "Updated")}
                      disabled={u.id === currentUserId}
                      className={`badge ${u.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"} ${u.id === currentUserId ? "" : "cursor-pointer"}`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted">{u.lastLoginAt ?? "Never"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { const p = prompt("New password (8+ chars):"); if (p) wrap(() => resetUserPassword(u.id, p), "Password reset"); }}
                        className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-brand" title="Reset password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      {u.id !== currentUserId ? (
                        <button
                          onClick={() => { if (confirm(`Delete ${u.email}?`)) wrap(() => deleteUser(u.id), "User deleted"); }}
                          className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-red-500" title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
