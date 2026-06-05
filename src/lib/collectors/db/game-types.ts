import type { GameTypeKey } from "@/lib/constants";
import { classifyGameName } from "@/lib/collectors/game-type-mapper";

const DB_GAME_TYPE_LABELS: Record<number, string> = {
  2001: "经典百家乐",
  2002: "极速百家乐",
  2003: "竞咪百家乐",
  2004: "包桌百家乐",
  2005: "共咪百家乐",
  2006: "龙虎",
  2007: "轮盘",
  2008: "骰宝",
  2009: "牛牛",
  2010: "炸金花",
  2011: "三公",
  2012: "21点",
  2013: "多台",
  2014: "高额百家乐",
  2015: "斗牛",
  2016: "保险百家乐",
  2017: "经典百家乐",
  2018: "百家乐大赛",
  2019: "德州扑克",
  2020: "番摊",
  2021: "21点",
  2022: "色碟",
  2023: "牌九",
  2025: "安达巴哈",
  2026: "印度炸金花",
  2027: "劲舞百家乐",
  2028: "OB滚球",
  2029: "六合彩",
  2030: "主播百家乐",
  2031: "3D游戏",
  2032: "5D游戏",
  2034: "闪电百家乐",
  2035: "赛车",
  2036: "多利",
  2038: "电投百家乐",
};

export function getDbGameTypeLabel(gameTypeId: number): string {
  return DB_GAME_TYPE_LABELS[gameTypeId] ?? `游戏${gameTypeId}`;
}

export function mapDbGameType(gameTypeId: number): GameTypeKey {
  const label = getDbGameTypeLabel(gameTypeId);
  return classifyGameName(label);
}
