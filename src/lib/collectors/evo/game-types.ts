import type { GameTypeKey } from "@/lib/constants";
import { classifyGameName } from "@/lib/collectors/game-type-mapper";

/** Evolution lobby.configs 中的 gt 字段映射 */
const EVO_GT_MAP: Record<string, GameTypeKey> = {
  baccarat: "baccarat",
  "rng-baccarat": "baccarat",
  bacbo: "baccarat",
  "rng-bacbo": "baccarat",
  blackjack: "blackjack",
  scalableblackjack: "blackjack",
  classicbetstackerbj: "blackjack",
  classicalways6bj: "blackjack",
  easybj: "blackjack",
  funfun21scalablebj: "blackjack",
  powerscalableblackjack: "blackjack",
  scalablebetstackerbj: "blackjack",
  "rng-blackjack": "blackjack",
  "rng-lightningscalablebj": "blackjack",
  roulette: "roulette",
  americanroulette: "roulette",
  instantroulette: "roulette",
  "rng-roulette": "roulette",
  "rng-american-roulette": "roulette",
  dragontiger: "dragonTiger",
  "rng-dragontiger": "dragonTiger",
  sicbo: "sicBo",
  "rng-sicbo": "sicBo",
  crazytime: "gameShow",
  megaball: "gameShow",
  "rng-megaball": "gameShow",
  moneywheel: "gameShow",
  "rng-moneywheel": "gameShow",
  balloonrace: "gameShow",
  icefishing: "gameShow",
  stockmarket: "gameShow",
  "rng-stockmarket": "gameShow",
  racetrack: "gameShow",
  "rng-racetrack": "gameShow",
  topcard: "gameShow",
  "rng-topcard": "gameShow",
  topdice: "gameShow",
  supercolorgame: "gameShow",
  deadoralivesaloon: "gameShow",
  twocoins: "gameShow",
  powerball: "gameShow",
  extrachilliepicspins: "gameShow",
  teenpatti: "poker",
  threecard: "poker",
  "rng-videopoker": "poker",
  fantan: "other",
  andarbahar: "other",
  craps: "other",
  "rng-craps": "other",
  "rng-hilo": "other",
  war: "other",
};

export type EvoLobbyTable = {
  id: string;
  title: string;
  gt: string;
  published: boolean;
};

export function mapEvoGameType(table: EvoLobbyTable): GameTypeKey {
  const fromGt = EVO_GT_MAP[table.gt.toLowerCase()];
  if (fromGt) return fromGt;
  return classifyGameName(`${table.title} ${table.gt}`);
}

export function parseEvoLobbyConfigs(
  configs: Record<string, { gt?: string; title?: string; published?: boolean }>,
): EvoLobbyTable[] {
  return Object.entries(configs)
    .map(([id, cfg]) => ({
      id,
      title: cfg.title?.trim() || id,
      gt: cfg.gt?.trim() || "unknown",
      published: cfg.published !== false,
    }))
    .filter((row) => row.published);
}
