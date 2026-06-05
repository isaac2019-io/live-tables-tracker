import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "密码至少 8 位"),
  role: z.enum(["viewer", "admin"]),
});

export async function listUsers() {
  const db = await getDb();
  return db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);
}

export async function createUser(input: z.infer<typeof createUserSchema>) {
  const db = await getDb();
  const email = input.email.toLowerCase();
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const [created] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        role: input.role,
      })
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    return created;
  } catch {
    throw new Error("该邮箱已存在");
  }
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!existing) {
    throw new Error("用户不存在");
  }

  await db.delete(users).where(eq(users.id, userId));
  return existing;
}
