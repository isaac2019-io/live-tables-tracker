import { recomputeDailyForSnapshotDate } from "@/lib/aggregates";
import { collectChoicePublicData } from "@/lib/collectors/choice-public";
import { collectDbPublicData } from "@/lib/collectors/db-public";
import { collectEvolutionPublicData } from "@/lib/collectors/evolution-public";
import { collectPragmaticPublicData } from "@/lib/collectors/pragmatic-public";
import type { PublicPlatformData } from "@/lib/collectors/public-platform-data";
import { getDb } from "@/lib/db";
import { snapshots } from "@/lib/db/schema";
import type { TableEntry } from "@/lib/table-entries";
import { saveSnapshotTables } from "@/lib/snapshot-tables";
import { ensureSystemUser } from "@/lib/system-user";
import type { GameTypeCounts } from "@/lib/constants";

function formatNote(data: PublicPlatformData) {
  const sourceList = data.sources.map((s) => s.title).join("、");
  return `[公开数据] ${data.methodology} 来源：${sourceList}`;
}

function countsToRow(counts: GameTypeCounts, totalTables: number) {
  return {
    totalTables,
    baccarat: counts.baccarat,
    blackjack: counts.blackjack,
    roulette: counts.roulette,
    dragonTiger: counts.dragonTiger,
    sicBo: counts.sicBo,
    gameShow: counts.gameShow,
    poker: counts.poker,
    other: counts.other,
  };
}

export async function upsertPublicSnapshot(
  data: PublicPlatformData,
  userId: number,
) {
  const db = await getDb();
  const recordedAt = data.recordedAt;
  const note = formatNote(data);
  const payload = {
    platform: data.platform,
    recordedAt,
    note,
    ...countsToRow(data.counts, data.totalTables),
    updatedAt: new Date(),
  };

  const [created] = await db
    .insert(snapshots)
    .values({
      ...payload,
      createdBy: userId,
    })
    .returning();

  await saveSnapshotTables(created.id, data.tables);
  await recomputeDailyForSnapshotDate(recordedAt);
  return created;
}

export async function syncPublicPlatformData() {
  const userId = await ensureSystemUser();
  const [evo, pragmatic, choice, db] = await Promise.all([
    collectEvolutionPublicData(),
    collectPragmaticPublicData(),
    collectChoicePublicData(),
    collectDbPublicData(),
  ]);

  const datasets = [evo, pragmatic, choice, db];

  const results = [];
  for (const data of datasets) {
    const snapshot = await upsertPublicSnapshot(data, userId);
    results.push({ data, snapshot });
  }

  return results;
}
