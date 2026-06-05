import { and, desc, eq, gte, lte } from "drizzle-orm";

import { computeDailyAggregate } from "@/lib/aggregates";
import { PLATFORMS, type PlatformSlug } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { dailyAggregates, snapshotTables, snapshots, users } from "@/lib/db/schema";
import type { GameTypeKey } from "@/lib/constants";
import { countsFromSnapshot } from "@/lib/snapshots";
import { recentUtc8Dates, toUtc8DateString, utc8DayBounds } from "@/lib/timezone";

export async function getLatestSnapshot(platform: PlatformSlug) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.platform, platform))
    .orderBy(desc(snapshots.recordedAt), desc(snapshots.id))
    .limit(1);

  return row ?? null;
}

export async function getLatestSnapshots() {
  const results = await Promise.all(
    PLATFORMS.map(async (platform) => ({
      platform: platform.slug,
      snapshot: await getLatestSnapshot(platform.slug),
    })),
  );
  return results;
}

export async function getSnapshotsForDay(date: string, platform?: PlatformSlug) {
  const db = await getDb();
  const { start, end } = utc8DayBounds(date);

  const conditions = [gte(snapshots.recordedAt, start), lte(snapshots.recordedAt, end)];
  if (platform) {
    conditions.push(eq(snapshots.platform, platform));
  }

  return db
    .select({
      snapshot: snapshots,
      creatorEmail: users.email,
    })
    .from(snapshots)
    .innerJoin(users, eq(users.id, snapshots.createdBy))
    .where(and(...conditions))
    .orderBy(desc(snapshots.recordedAt));
}

export async function getSnapshotsInRange(
  platform: PlatformSlug,
  startDate: string,
  endDate: string,
) {
  const db = await getDb();
  const start = utc8DayBounds(startDate).start;
  const end = utc8DayBounds(endDate).end;

  return db
    .select()
    .from(snapshots)
    .where(
      and(
        eq(snapshots.platform, platform),
        gte(snapshots.recordedAt, start),
        lte(snapshots.recordedAt, end),
      ),
    )
    .orderBy(snapshots.recordedAt);
}

export async function getDailyAggregate(
  date: string,
  platform: PlatformSlug,
  computeIfMissing = true,
) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(dailyAggregates)
    .where(and(eq(dailyAggregates.date, date), eq(dailyAggregates.platform, platform)))
    .limit(1);

  if (row || !computeIfMissing) {
    return row ?? null;
  }

  const computed = await computeDailyAggregate(date, platform);
  if (!computed) return null;

  const [fresh] = await db
    .select()
    .from(dailyAggregates)
    .where(and(eq(dailyAggregates.date, date), eq(dailyAggregates.platform, platform)))
    .limit(1);

  return fresh ?? null;
}

export async function getDailyAggregatesForDate(date: string) {
  return Promise.all(
    PLATFORMS.map(async (platform) => ({
      platform: platform.slug,
      aggregate: await getDailyAggregate(date, platform.slug),
    })),
  );
}

export async function getRecentDailySummaries(days = 7) {
  const dates = recentUtc8Dates(days).reverse();
  const summaries = [];

  for (const date of dates) {
    const aggregates = await getDailyAggregatesForDate(date);
    summaries.push({ date, aggregates });
  }

  return summaries;
}

export function snapshotToBreakdown(snapshot: typeof snapshots.$inferSelect) {
  const counts = countsFromSnapshot(snapshot);
  return {
    total: snapshot.totalTables,
    counts,
    recordedAt: snapshot.recordedAt,
    note: snapshot.note,
  };
}

export async function getSnapshotTables(snapshotId: number) {
  const db = await getDb();
  return db
    .select()
    .from(snapshotTables)
    .where(eq(snapshotTables.snapshotId, snapshotId))
    .orderBy(snapshotTables.gameType, snapshotTables.tableName);
}

export async function getLatestSnapshotTables(platform: PlatformSlug) {
  const latest = await getLatestSnapshot(platform);
  if (!latest) return [];
  return getSnapshotTables(latest.id);
}

export function groupSnapshotTablesByType(
  rows: (typeof snapshotTables.$inferSelect)[],
) {
  const grouped = new Map<GameTypeKey, (typeof snapshotTables.$inferSelect)[]>();

  for (const row of rows) {
    const key = row.gameType as GameTypeKey;
    const bucket = grouped.get(key) ?? [];
    bucket.push(row);
    grouped.set(key, bucket);
  }

  return grouped;
}

export function groupSnapshotsByUtc8Date(rows: (typeof snapshots.$inferSelect)[]) {
  const grouped = new Map<string, typeof snapshots.$inferSelect[]>();

  for (const row of rows) {
    const date = toUtc8DateString(row.recordedAt);
    const bucket = grouped.get(date) ?? [];
    bucket.push(row);
    grouped.set(date, bucket);
  }

  return grouped;
}
