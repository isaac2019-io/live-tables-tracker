import { z } from "zod";

import {
  GAME_TYPE_KEYS,
  type GameTypeCounts,
  type PlatformSlug,
  sumGameTypeCounts,
} from "@/lib/constants";
import type { snapshots } from "@/lib/db/schema";

export const snapshotInputSchema = z.object({
  platform: z.enum(["evo", "pragmatic", "choice"]),
  recordedAt: z.string().min(1),
  note: z.string().max(500).optional(),
  counts: z.object({
    baccarat: z.coerce.number().int().min(0),
    blackjack: z.coerce.number().int().min(0),
    roulette: z.coerce.number().int().min(0),
    dragonTiger: z.coerce.number().int().min(0),
    sicBo: z.coerce.number().int().min(0),
    gameShow: z.coerce.number().int().min(0),
    poker: z.coerce.number().int().min(0),
    other: z.coerce.number().int().min(0),
  }),
});

export type SnapshotInput = z.infer<typeof snapshotInputSchema>;

export function countsFromSnapshot(row: typeof snapshots.$inferSelect): GameTypeCounts {
  return {
    baccarat: row.baccarat,
    blackjack: row.blackjack,
    roulette: row.roulette,
    dragonTiger: row.dragonTiger,
    sicBo: row.sicBo,
    gameShow: row.gameShow,
    poker: row.poker,
    other: row.other,
  };
}

export function countsToSnapshotColumns(counts: GameTypeCounts) {
  return {
    baccarat: counts.baccarat,
    blackjack: counts.blackjack,
    roulette: counts.roulette,
    dragonTiger: counts.dragonTiger,
    sicBo: counts.sicBo,
    gameShow: counts.gameShow,
    poker: counts.poker,
    other: counts.other,
    totalTables: sumGameTypeCounts(counts),
  };
}

export function validateCountsComplete(counts: GameTypeCounts) {
  for (const key of GAME_TYPE_KEYS) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) {
      return `游戏类型 ${key} 必须填写非负整数`;
    }
  }
  return null;
}

export function buildSnapshotPayload(
  platform: PlatformSlug,
  recordedAt: Date,
  counts: GameTypeCounts,
  note?: string | null,
) {
  const validationError = validateCountsComplete(counts);
  if (validationError) {
    throw new Error(validationError);
  }

  const total = sumGameTypeCounts(counts);
  return {
    platform,
    recordedAt,
    note: note?.trim() || null,
    ...countsToSnapshotColumns(counts),
    totalTables: total,
  };
}
