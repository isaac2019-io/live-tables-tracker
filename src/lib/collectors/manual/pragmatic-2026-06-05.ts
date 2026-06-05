import type { GameTypeCounts } from "@/lib/constants";
import {
  buildManualPlatformData,
  buildTablesFromSections,
  type SheetSection,
} from "@/lib/collectors/manual/helpers";

/** Pragmatic Play 游戏桌台统计 — 2026.06.05，总桌台 421 */
export const PRAGMATIC_SHEET_COUNTS: GameTypeCounts = {
  baccarat: 57,
  blackjack: 312,
  roulette: 27,
  dragonTiger: 1,
  sicBo: 0,
  gameShow: 22,
  poker: 2,
  other: 0,
};

const PRAGMATIC_SECTIONS: SheetSection[] = [
  { label: "百家乐", gameType: "baccarat", count: 57 },
  { label: "青龙专业二十一点", gameType: "blackjack", count: 23 },
  { label: "天然二十一点", gameType: "blackjack", count: 8 },
  { label: "极速二十一点", gameType: "blackjack", count: 55 },
  { label: "尊享皇家二十一点", gameType: "blackjack", count: 11 },
  { label: "二十一点 A", gameType: "blackjack", count: 115 },
  { label: "二十一点", gameType: "blackjack", count: 40 },
  { label: "十不其多二十一点", gameType: "blackjack", count: 27 },
  { label: "巴西二十一点", gameType: "blackjack", count: 20 },
  { label: "专业二十一点", gameType: "blackjack", count: 13 },
  { label: "轮盘", gameType: "roulette", count: 27 },
  { label: "德州扑克", gameType: "poker", count: 1 },
  { label: "三张牌扑克", gameType: "poker", count: 1 },
  { label: "龙虎", gameType: "dragonTiger", count: 1 },
  { label: "真人秀", gameType: "gameShow", count: 22 },
];

export function buildPragmaticSheetData() {
  return buildManualPlatformData({
    platform: "pragmatic",
    sheetDate: "2026-06-05",
    sheetTitle: "Pragmatic Play 游戏桌台统计",
    counts: PRAGMATIC_SHEET_COUNTS,
    tables: buildTablesFromSections(PRAGMATIC_SECTIONS),
    sources: [{ title: "Pragmatic Play 手工统计表 2026.06.05" }],
  });
}
