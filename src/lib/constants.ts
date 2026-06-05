export const TIMEZONE = "Asia/Shanghai";

export const PLATFORMS = [
  { slug: "evo", label: "Evo", fullName: "Evolution" },
  { slug: "pragmatic", label: "Pragmatic Play", fullName: "Pragmatic Play" },
  { slug: "choice", label: "Choice", fullName: "Choice Gaming" },
] as const;

export type PlatformSlug = (typeof PLATFORMS)[number]["slug"];

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
