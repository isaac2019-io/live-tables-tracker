import { recomputeDailyForSnapshotDate } from "@/lib/aggregates";
import {
  groupEntryRows,
  parseEntryTemplateCsv,
} from "@/lib/entry-template";
import { getDb } from "@/lib/db";
import { snapshots } from "@/lib/db/schema";
import { saveSnapshotTables } from "@/lib/snapshot-tables";
import { countsToSnapshotColumns } from "@/lib/snapshots";
import { parseUtc8DateTime } from "@/lib/timezone";

export async function importSnapshotsFromCsv(content: string, userId: number) {
  const rows = parseEntryTemplateCsv(content);
  const groups = groupEntryRows(rows);
  const db = await getDb();
  const created = [];

  for (const group of groups) {
    const recordedAt = parseUtc8DateTime(group.recordedAtUtc8);
    const note = group.note?.trim() || "[人工录入] CSV 模板导入";

    const [snapshot] = await db
      .insert(snapshots)
      .values({
        platform: group.platform,
        recordedAt,
        note,
        createdBy: userId,
        updatedAt: new Date(),
        ...countsToSnapshotColumns(group.counts),
      })
      .returning();

    await saveSnapshotTables(snapshot.id, group.tables);

    await recomputeDailyForSnapshotDate(recordedAt);
    created.push(snapshot);
  }

  return created;
}
