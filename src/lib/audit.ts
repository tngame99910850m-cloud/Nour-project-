import { prisma } from "./prisma";
import type { SessionPayload } from "./auth";

interface AuditInput {
  action: string;
  entity?: string;
  entityId?: string;
  summary: string;
  before?: unknown;
  after?: unknown;
}

export async function logAudit(session: SessionPayload | null, input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: session?.userId ?? null,
        userName: session?.name ?? "System",
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        summary: input.summary,
        before: input.before === undefined ? undefined : (input.before as any),
        after: input.after === undefined ? undefined : (input.after as any),
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
