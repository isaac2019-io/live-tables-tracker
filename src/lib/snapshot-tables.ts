import { getDb } from "@/lib/db";
import { snapshotTables } from "@/lib/db/schema";
import type { TableEntry } from "@/lib/table-entries";
import { eq } from "drizzle-orm";

export async function saveSnapshotTables(snapshotId: number, tables: TableEntry[]) {
  if (tables.length === 0) return;
  const db = await getDb();

  await db.insert(snapshotTables).values(
    tables.map((table) => ({
      snapshotId,
      tableName: table.name,
      gameType: table.gameType,
    })),
  );
}

export async function replaceSnapshotTables(snapshotId: number, tables: TableEntry[]) {
  const db = await getDb();
  await db.delete(snapshotTables).where(eq(snapshotTables.snapshotId, snapshotId));
  await saveSnapshotTables(snapshotId, tables);
}
