import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { count } from "drizzle-orm";
import bcrypt from "bcryptjs";

import * as schema from "@/lib/db/schema";

const globalForDb = globalThis as typeof globalThis & {
  __sqlite?: Database.Database;
  __db?: ReturnType<typeof drizzle>;
  __dbInitialized?: boolean;
};

function getDatabasePath() {
  const configured =
    process.env.DATABASE_PATH ??
    (process.env.VERCEL ? "/tmp/data/app.db" : "data/app.db");
  if (path.isAbsolute(configured)) return configured;
  return path.join(/* turbopackIgnore: true */ process.cwd(), configured);
}

function createSqlite() {
  const dbPath = getDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return sqlite;
}

function ensureMigrated(sqlite: Database.Database) {
  const migrationsFolder = path.join(process.cwd(), "drizzle");
  if (!fs.existsSync(migrationsFolder)) return;
  migrate(drizzle(sqlite), { migrationsFolder });
}

async function seedAdminIfNeeded(db: ReturnType<typeof drizzle>) {
  const [result] = await db.select({ value: count() }).from(schema.users);
  if ((result?.value ?? 0) > 0) return;

  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await db.insert(schema.users).values({
      email,
      passwordHash,
      role: "admin",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      /UNIQUE constraint failed/i.test(error.message)
    ) {
      return;
    }
    throw error;
  }
}

export async function getDb() {
  if (!globalForDb.__sqlite) {
    globalForDb.__sqlite = createSqlite();
    globalForDb.__db = drizzle(globalForDb.__sqlite, { schema });
  }

  const db = globalForDb.__db!;

  if (!globalForDb.__dbInitialized) {
    ensureMigrated(globalForDb.__sqlite!);
    await seedAdminIfNeeded(db);
    globalForDb.__dbInitialized = true;
  }

  return db;
}
