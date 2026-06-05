import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

const SYSTEM_EMAIL = "system@live-tables-tracker.local";

export async function ensureSystemUser() {
  const db = await getDb();
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, SYSTEM_EMAIL))
    .limit(1);

  if (existing) return existing.id;

  const passwordHash = await bcrypt.hash(
    `system-${process.env.AUTH_SECRET ?? "dev"}`,
    12,
  );

  const [created] = await db
    .insert(users)
    .values({
      email: SYSTEM_EMAIL,
      passwordHash,
      role: "admin",
    })
    .returning();

  return created.id;
}
