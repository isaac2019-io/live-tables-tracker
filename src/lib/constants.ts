export const TIMEZONE = "Asia/Shanghai";

export const PLATFORMS = [
  { slug: "db", label: "DB", fullName: "DB Gaming", hasHalls: true },
  { slug: "evo", label: "Evo", fullName: "Evolution" },
  { slug: "pragmatic", label: "Pragmatic Play", fullName: "Pragmatic Play" },
  { slug: "choice", label: "Choice", fullName: "Choice Gaming" },
] as const;

export type PlatformSlug = (typeof PLATFORMS)[number]["slug"];

/** DB 平台下属厅 */
export const DB_HALLS = [
  { slug: "flagship", label: "旗舰厅", labelEn: "Flagship" },
  { slug: "international", label: "国际厅", labelEn: "International" },
  { slug: "asia-pacific", label: "亚太厅", labelEn: "Asia Pacific" },
  { slug: "vietnam", label: "越南厅", labelEn: "Vietnam" },
  { slug: "europe", label: "欧洲厅", labelEn: "Europe" },
  { slug: "americas", label: "美洲厅", labelEn: "Americas" },
  { slug: "ebet", label: "电投厅", labelEn: "E-Bet" },
] as const;

export type DbHallSlug = (typeof DB_HALLS)[number]["slug"];

export const DB_HALL_SLUGS = DB_HALLS.map((hall) => hall.slug) as DbHallSlug[];

export const GAME_TYPES = [
  { key: "baccarat", labelZh: "百家乐", labelEn: "Baccarat" },
  { key: "blackjack", labelZh: "二十一点", labelEn: "Blackjack" },
  { key: "roulette", labelZh: "轮盘", labelEn: "Roulette" },
  { key: "dragonTiger", labelZh: "龙虎", labelEn: "Dragon Tiger" },
  { key: "sicBo", labelZh: "骰宝", labelEn: "Sic Bo" },
  { key: "gameShow", labelZh: "游戏秀", labelEn: "Game Show" },
  { key: "poker", labelZh: "扑克类", labelEn: "Poker" },
  { key: "other", labelZh: "其他", labelEn: "Other" },
] as const;

export type GameTypeKey = (typeof GAME_TYPES)[number]["key"];

export const GAME_TYPE_KEYS = GAME_TYPES.map((g) => g.key) as GameTypeKey[];

export type GameTypeCounts = Record<GameTypeKey, number>;

export function emptyGameTypeCounts(): GameTypeCounts {
  return {
    baccarat: 0,
    blackjack: 0,
    roulette: 0,
    dragonTiger: 0,
    sicBo: 0,
    gameShow: 0,
    poker: 0,
    other: 0,
  };
}

export function sumGameTypeCounts(counts: GameTypeCounts): number {
  return GAME_TYPE_KEYS.reduce((sum, key) => sum + counts[key], 0);
}

export function isPlatformSlug(value: string): value is PlatformSlug {
  return PLATFORMS.some((p) => p.slug === value);
}

export function getPlatform(slug: string) {
  return PLATFORMS.find((p) => p.slug === slug);
}

export function platformHasHalls(slug: PlatformSlug) {
  const platform = getPlatform(slug);
  return Boolean(platform && "hasHalls" in platform && platform.hasHalls);
}

export function isDbHallSlug(value: string): value is DbHallSlug {
  return DB_HALLS.some((hall) => hall.slug === value);
}

export function getDbHall(slug: string) {
  return DB_HALLS.find((hall) => hall.slug === slug);
}
