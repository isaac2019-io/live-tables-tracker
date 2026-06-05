import { getDb } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export async function writeAuditLog(input: {
  userId: number;
  action: string;
  entityType: string;
  entityId?: number;
  payload?: unknown;
}) {
  const db = await getDb();
  await db.insert(auditLogs).values({
    userId: input.userId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    payload: input.payload ? JSON.stringify(input.payload) : null,
  });
}
