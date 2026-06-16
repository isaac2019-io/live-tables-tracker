import { z } from "zod";

import { recomputeDailyForSnapshotDate } from "@/lib/aggregates";
import {
  DB_HALL_SLUGS,
  GAME_TYPE_KEYS,
  PLATFORMS,
  type GameTypeCounts,
  type PlatformSlug,
  sumGameTypeCounts,
} from "@/lib/constants";
import { getDb } from "@/lib/db";
import { snapshots } from "@/lib/db/schema";
import { getLatestSnapshot, getSnapshotTables } from "@/lib/queries";
import { saveSnapshotTables } from "@/lib/snapshot-tables";
import { countsToSnapshotColumns } from "@/lib/snapshots";
import type { TableEntry } from "@/lib/table-entries";
import { formatUtc8ForInput, parseUtc8DateTime } from "@/lib/timezone";

export const SNAPSHOT_BUNDLE_VERSION = 1;

const tableEntrySchema = z.object({
  name: z.string().min(1),
  gameType: z.enum(GAME_TYPE_KEYS as [string, ...string[]]),
  hall: z.enum(DB_HALL_SLUGS as [string, ...string[]]).optional().nullable(),
});

const snapshotBundleItemSchema = z.object({
  platform: z.enum(["db", "evo", "pragmatic", "choice"]),
  recordedAt: z.string().min(1),
  note: z.string().nullable().optional(),
  totalTables: z.number().int().min(0),
  counts: z.object({
    baccarat: z.number().int().min(0),
    blackjack: z.number().int().min(0),
    roulette: z.number().int().min(0),
    dragonTiger: z.number().int().min(0),
    sicBo: z.number().int().min(0),
    gameShow: z.number().int().min(0),
    poker: z.number().int().min(0),
    other: z.number().int().min(0),
  }),
  tables: z.array(tableEntrySchema),
});

export const snapshotBundleSchema = z.object({
  version: z.literal(SNAPSHOT_BUNDLE_VERSION),
  exportedAt: z.string().min(1),
  snapshots: z.array(snapshotBundleItemSchema).min(1),
});

export type SnapshotBundle = z.infer<typeof snapshotBundleSchema>;
export type SnapshotBundleItem = z.infer<typeof snapshotBundleItemSchema>;

function countsMatchTables(counts: GameTypeCounts, tables: TableEntry[]) {
  const summed = tables.reduce(
    (acc, row) => {
      acc[row.gameType] += 1;
      return acc;
    },
    {
      baccarat: 0,
      blackjack: 0,
      roulette: 0,
      dragonTiger: 0,
      sicBo: 0,
      gameShow: 0,
      poker: 0,
      other: 0,
    } as GameTypeCounts,
  );

  for (const key of GAME_TYPE_KEYS) {
    if (summed[key] !== counts[key]) {
      throw new Error(
        `${key} 桌台数不一致：快照汇总 ${counts[key]}，明细 ${summed[key]}`,
      );
    }
  }

  if (sumGameTypeCounts(counts) !== tables.length) {
    throw new Error("桌台总数与明细行数不一致");
  }
}

export async function buildLatestSnapshotBundle(): Promise<SnapshotBundle> {
  const items: SnapshotBundleItem[] = [];

  for (const platform of PLATFORMS) {
    const snapshot = await getLatestSnapshot(platform.slug);
    if (!snapshot) continue;

    const rows = await getSnapshotTables(snapshot.id);
    const tables: TableEntry[] = rows.map((row) => ({
      name: row.tableName,
      gameType: row.gameType as TableEntry["gameType"],
      ...(row.hall ? { hall: row.hall as TableEntry["hall"] } : {}),
    }));

    items.push({
      platform: snapshot.platform,
      recordedAt: formatUtc8ForInput(snapshot.recordedAt),
      note: snapshot.note,
      totalTables: snapshot.totalTables,
      counts: {
        baccarat: snapshot.baccarat,
        blackjack: snapshot.blackjack,
        roulette: snapshot.roulette,
        dragonTiger: snapshot.dragonTiger,
        sicBo: snapshot.sicBo,
        gameShow: snapshot.gameShow,
        poker: snapshot.poker,
        other: snapshot.other,
      },
      tables,
    });
  }

  if (items.length === 0) {
    throw new Error("没有可导出的快照数据");
  }

  return {
    version: SNAPSHOT_BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    snapshots: items,
  };
}

export async function importSnapshotBundle(bundle: SnapshotBundle, userId: number) {
  const parsed = snapshotBundleSchema.parse(bundle);
  const db = await getDb();
  const created = [];

  for (const item of parsed.snapshots) {
    const tables: TableEntry[] = item.tables.map((row) => ({
      name: row.name,
      gameType: row.gameType as TableEntry["gameType"],
      ...(row.hall ? { hall: row.hall as TableEntry["hall"] } : {}),
    }));

    countsMatchTables(item.counts as GameTypeCounts, tables);

    const recordedAt = parseUtc8DateTime(item.recordedAt);
    const note =
      item.note?.trim() ||
      `[快照导入] 自本地 bundle 导入（${parsed.exportedAt}）`;

    const [snapshot] = await db
      .insert(snapshots)
      .values({
        platform: item.platform as PlatformSlug,
        recordedAt,
        note,
        createdBy: userId,
        updatedAt: new Date(),
        ...countsToSnapshotColumns(item.counts as GameTypeCounts),
      })
      .returning();

    await saveSnapshotTables(snapshot.id, tables);
    await recomputeDailyForSnapshotDate(recordedAt);
    created.push(snapshot);
  }

  return created;
}

export function bundleFilename(exportedAt = new Date()) {
  const stamp = exportedAt.toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `live-tables-snapshots-${stamp}.json`;
}
