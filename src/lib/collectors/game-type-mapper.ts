import type { GameTypeKey } from "@/lib/constants";

const RULES: { type: GameTypeKey; patterns: RegExp[] }[] = [
  {
    type: "baccarat",
    patterns: [/baccarat/i, /sic\s*bac/i, /bac\s*bo/i],
  },
  {
    type: "blackjack",
    patterns: [/blackjack/i, /\bbj\b/i],
  },
  {
    type: "roulette",
    patterns: [/roulette/i, /ruleta/i],
  },
  {
    type: "dragonTiger",
    patterns: [/dragon\s*tiger/i, /dragon\s*dragon/i],
  },
  {
    type: "sicBo",
    patterns: [/sic\s*bo/i],
  },
  {
    type: "gameShow",
    patterns: [
      /wheel/i,
      /crazy\s*time/i,
      /monopoly/i,
      /dream\s*catcher/i,
      /mega\s*ball/i,
      /game\s*show/i,
      /ball\s*bonanza/i,
      /money\s*time/i,
      /bingo/i,
      /pachinko/i,
      /balloon/i,
      /dice\s*city/i,
      /snakes/i,
      /boom\s*city/i,
      /candyland/i,
      /studio/i,
      /stock\s*market/i,
      /race\s*track/i,
      /funky\s*time/i,
      /lightning\s*storm/i,
      /ice\s*fishing/i,
      /marble\s*race/i,
      /coin\s*flip/i,
      /red\s*baron/i,
      /football/i,
      /top\s*card/i,
      /mega\s*wheel/i,
      /vegas\s*ball/i,
    ],
  },
  {
    type: "poker",
    patterns: [/poker/i, /hold.?em/i, /teen\s*patti/i],
  },
  {
    type: "other",
    patterns: [/andar\s*bahar/i, /fan\s*tan/i, /craps/i, /lobby/i],
  },
];

export function classifyGameName(name: string): GameTypeKey {
  const normalized = name.trim();

  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      return rule.type;
    }
  }

  return "other";
}

export function emptyCountsRecord(): Record<GameTypeKey, number> {
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

export function addToCounts(
  counts: Record<GameTypeKey, number>,
  name: string,
  amount = 1,
) {
  const type = classifyGameName(name);
  counts[type] += amount;
}
