import type { GameTypeCounts } from "@/lib/constants";
import {
  buildManualPlatformData,
  buildTablesFromSections,
  type SheetSection,
} from "@/lib/collectors/manual/helpers";

/** Evolution 游戏桌台统计 — 2026.05.05，总桌台 393 */
export const EVO_SHEET_COUNTS: GameTypeCounts = {
  baccarat: 113,
  blackjack: 171,
  roulette: 29,
  dragonTiger: 8,
  sicBo: 9,
  gameShow: 31,
  poker: 8,
  other: 24,
};

const EVO_SECTIONS: SheetSection[] = [
  { label: "百家乐", gameType: "baccarat", count: 2 },
  { label: "速度百家乐", gameType: "baccarat", count: 12 },
  { label: "繁体百家乐", gameType: "baccarat", count: 10 },
  { label: "繁体免佣百家乐", gameType: "baccarat", count: 5 },
  { label: "极速百家乐", gameType: "baccarat", count: 26 },
  { label: "尊爵百家乐", gameType: "baccarat", count: 2 },
  { label: "决定性人类百家乐(私人桌)", gameType: "baccarat", count: 12 },
  { label: "区域性百家乐", gameType: "baccarat", count: 44 },
  { label: "极速VIP二十一点", gameType: "blackjack", count: 17 },
  { label: "Evo独家二十一点", gameType: "blackjack", count: 9 },
  { label: "碧蓝极速二十一点", gameType: "blackjack", count: 12 },
  { label: "二十一点 VIP", gameType: "blackjack", count: 41 },
  { label: "旗舰二十一点", gameType: "blackjack", count: 16 },
  { label: "区域性二十一点", gameType: "blackjack", count: 76 },
  { label: "轮盘", gameType: "roulette", count: 29 },
  { label: "骰宝", gameType: "sicBo", count: 9 },
  { label: "骨牌", gameType: "other", count: 1 },
  { label: "龙虎", gameType: "dragonTiger", count: 8 },
  { label: "扑克牌", gameType: "poker", count: 8 },
  { label: "真人秀", gameType: "gameShow", count: 31 },
  { label: "单机版", gameType: "other", count: 23 },
];

export function buildEvoSheetData() {
  return buildManualPlatformData({
    platform: "evo",
    sheetDate: "2026-05-05",
    sheetTitle: "Evolution 游戏桌台统计",
    counts: EVO_SHEET_COUNTS,
    tables: buildTablesFromSections(EVO_SECTIONS),
    sources: [{ title: "Evolution 手工统计表 2026.05.05" }],
  });
}
