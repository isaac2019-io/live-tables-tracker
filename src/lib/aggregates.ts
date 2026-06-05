import { subDays } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { and, asc, eq, gte, lte } from "drizzle-orm";

import { TIMEZONE, type GameTypeKey, PLATFORMS, type PlatformSlug } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { dailyAggregates, snapshots } from "@/lib/db/schema";
import { utc8DayBounds } from "@/lib/timezone";

type Metric = { avg: number; min: number; max: number };

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function minValue(values: number[]) {
  return values.length === 0 ? 0 : Math.min(...values);
}

function maxValue(values: number[]) {
  return values.length === 0 ? 0 : Math.max(...values);
}

function buildMetric(values: number[]): Metric {
  return {
    avg: average(values),
    min: minValue(values),
    max: maxValue(values),
  };
}

export async function computeDailyAggregate(date: string, platform: PlatformSlug) {
  const db = await getDb();
  const { start, end } = utc8DayBounds(date);

  const rows = await db
    .select()
    .from(snapshots)
    .where(
      and(
        eq(snapshots.platform, platform),
        gte(snapshots.recordedAt, start),
        lte(snapshots.recordedAt, end),
      ),
    )
    .orderBy(asc(snapshots.recordedAt));

  if (rows.length === 0) {
    await db
      .delete(dailyAggregates)
      .where(and(eq(dailyAggregates.date, date), eq(dailyAggregates.platform, platform)));
    return null;
  }

  const totals = rows.map((row) => row.totalTables);
  const totalMetric = buildMetric(totals);

  const gameMetrics = {
    baccarat: buildMetric(rows.map((row) => row.baccarat)),
    blackjack: buildMetric(rows.map((row) => row.blackjack)),
    roulette: buildMetric(rows.map((row) => row.roulette)),
    dragonTiger: buildMetric(rows.map((row) => row.dragonTiger)),
    sicBo: buildMetric(rows.map((row) => row.sicBo)),
    gameShow: buildMetric(rows.map((row) => row.gameShow)),
    poker: buildMetric(rows.map((row) => row.poker)),
    other: buildMetric(rows.map((row) => row.other)),
  };

  let peakRow = rows[0];
  let troughRow = rows[0];
  for (const row of rows) {
    if (row.totalTables > peakRow.totalTables) peakRow = row;
    if (row.totalTables < troughRow.totalTables) troughRow = row;
  }

  const payload = {
    date,
    platform,
    snapshotCount: rows.length,
    totalOpen: rows[0].totalTables,
    totalClose: rows[rows.length - 1].totalTables,
    totalAvg: totalMetric.avg,
    totalMin: totalMetric.min,
    totalMax: totalMetric.max,
    baccaratAvg: gameMetrics.baccarat.avg,
    baccaratMin: gameMetrics.baccarat.min,
    baccaratMax: gameMetrics.baccarat.max,
    blackjackAvg: gameMetrics.blackjack.avg,
    blackjackMin: gameMetrics.blackjack.min,
    blackjackMax: gameMetrics.blackjack.max,
    rouletteAvg: gameMetrics.roulette.avg,
    rouletteMin: gameMetrics.roulette.min,
    rouletteMax: gameMetrics.roulette.max,
    dragonTigerAvg: gameMetrics.dragonTiger.avg,
    dragonTigerMin: gameMetrics.dragonTiger.min,
    dragonTigerMax: gameMetrics.dragonTiger.max,
    sicBoAvg: gameMetrics.sicBo.avg,
    sicBoMin: gameMetrics.sicBo.min,
    sicBoMax: gameMetrics.sicBo.max,
    gameShowAvg: gameMetrics.gameShow.avg,
    gameShowMin: gameMetrics.gameShow.min,
    gameShowMax: gameMetrics.gameShow.max,
    pokerAvg: gameMetrics.poker.avg,
    pokerMin: gameMetrics.poker.min,
    pokerMax: gameMetrics.poker.max,
    otherAvg: gameMetrics.other.avg,
    otherMin: gameMetrics.other.min,
    otherMax: gameMetrics.other.max,
    peakAt: peakRow.recordedAt,
    troughAt: troughRow.recordedAt,
    computedAt: new Date(),
  };

  const existing = await db
    .select()
    .from(dailyAggregates)
    .where(and(eq(dailyAggregates.date, date), eq(dailyAggregates.platform, platform)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(dailyAggregates)
      .set(payload)
      .where(eq(dailyAggregates.id, existing[0].id));
  } else {
    await db.insert(dailyAggregates).values(payload);
  }

  return payload;
}

export async function recomputeDailyForDate(date: string) {
  const results = [];
  for (const platform of PLATFORMS) {
    results.push(await computeDailyAggregate(date, platform.slug));
  }
  return results;
}

export async function recomputeDailyForSnapshotDate(recordedAt: Date) {
  const { toUtc8DateString } = await import("@/lib/timezone");
  const date = toUtc8DateString(recordedAt);
  return recomputeDailyForDate(date);
}

export function getPreviousUtc8DateString() {
  const zonedNow = toZonedTime(new Date(), TIMEZONE);
  return formatInTimeZone(subDays(zonedNow, 1), TIMEZONE, "yyyy-MM-dd");
}

export async function recomputePreviousUtc8Day() {
  const date = getPreviousUtc8DateString();
  const results = await recomputeDailyForDate(date);
  return { date, results };
}

export function aggregateGameTypeAverages(
  aggregate: typeof dailyAggregates.$inferSelect,
  key: GameTypeKey,
) {
  const map: Record<GameTypeKey, { avg: number; min: number; max: number }> = {
    baccarat: {
      avg: aggregate.baccaratAvg,
      min: aggregate.baccaratMin,
      max: aggregate.baccaratMax,
    },
    blackjack: {
      avg: aggregate.blackjackAvg,
      min: aggregate.blackjackMin,
      max: aggregate.blackjackMax,
    },
    roulette: {
      avg: aggregate.rouletteAvg,
      min: aggregate.rouletteMin,
      max: aggregate.rouletteMax,
    },
    dragonTiger: {
      avg: aggregate.dragonTigerAvg,
      min: aggregate.dragonTigerMin,
      max: aggregate.dragonTigerMax,
    },
    sicBo: {
      avg: aggregate.sicBoAvg,
      min: aggregate.sicBoMin,
      max: aggregate.sicBoMax,
    },
    gameShow: {
      avg: aggregate.gameShowAvg,
      min: aggregate.gameShowMin,
      max: aggregate.gameShowMax,
    },
    poker: {
      avg: aggregate.pokerAvg,
      min: aggregate.pokerMin,
      max: aggregate.pokerMax,
    },
    other: {
      avg: aggregate.otherAvg,
      min: aggregate.otherMin,
      max: aggregate.otherMax,
    },
  };

  return map[key];
}
