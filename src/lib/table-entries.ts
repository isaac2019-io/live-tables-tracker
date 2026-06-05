import type { DbHallSlug, GameTypeKey } from "@/lib/constants";
import { classifyGameName } from "@/lib/collectors/game-type-mapper";

export type TableEntry = {
  name: string;
  gameType: GameTypeKey;
  hall?: DbHallSlug;
};

export function expandTableNames(
  label: string,
  count: number,
  gameType?: GameTypeKey,
): TableEntry[] {
  const type = gameType ?? classifyGameName(label);
  if (count <= 0) return [];

  if (count === 1) {
    return [{ name: label, gameType: type }];
  }

  return Array.from({ length: count }, (_, index) => ({
    name: `${label} ${index + 1}`,
    gameType: type,
  }));
}

export function mergeTableEntries(groups: TableEntry[][]): TableEntry[] {
  return groups.flat();
}

export function summarizeCounts(entries: TableEntry[]) {
  const counts: Record<GameTypeKey, number> = {
    baccarat: 0,
    blackjack: 0,
    roulette: 0,
    dragonTiger: 0,
    sicBo: 0,
    gameShow: 0,
    poker: 0,
    other: 0,
  };

  for (const entry of entries) {
    counts[entry.gameType] += 1;
  }

  const totalTables = entries.length;
  return { counts, totalTables };
}

export function groupTablesByGameType(entries: TableEntry[]) {
  const grouped = new Map<GameTypeKey, TableEntry[]>();

  for (const entry of entries) {
    const bucket = grouped.get(entry.gameType) ?? [];
    bucket.push(entry);
    grouped.set(entry.gameType, bucket);
  }

  return grouped;
}
