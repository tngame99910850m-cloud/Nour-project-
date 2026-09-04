import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { UsersManager } from "@/components/dashboard/users-manager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [users, session] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getSession(),
  ]);

  return (
    <div>
      <PageHeader title="Users & Roles" description="Manage who can access the dashboards and what they can do." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { role: "OWNER", desc: "Full access to everything" },
          { role: "ADMIN", desc: "Business management" },
          { role: "STAFF", desc: "Limited operations" },
          { role: "DEVELOPER", desc: "Technical configuration" },
        ].map((r) => (
          <Card key={r.role}>
            <p className="font-semibold">{r.role}</p>
            <p className="text-xs text-muted">{r.desc}</p>
            <p className="mt-2 text-2xl font-semibold">{users.filter((u) => u.role === r.role).length}</p>
          </Card>
        ))}
      </div>

      <UsersManager
        currentUserId={session?.userId ?? ""}
        users={users.map((u) => ({
          id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive,
          lastLoginAt: u.lastLoginAt ? formatDate(u.lastLoginAt) : null,
        }))}
      />
    </div>
  );
}
