import type { GameTypeKey } from "@/lib/constants";
import type { PublicPlatformData } from "@/lib/collectors/public-platform-data";
import {
  expandTableNames,
  summarizeCounts,
  type TableEntry,
} from "@/lib/table-entries";

const EVO_TOTAL_TABLES = 1700;

const EVO_SOURCES = [
  {
    title: "Evolution Annual Report 2024",
    url: "https://www.evolution.com/wp-content/uploads/2025/04/Evolution-Annual-Report-2024.pdf",
  },
  {
    title: "Evolution Live Blackjack",
    url: "https://www.evolution.com/games/live-blackjack/",
  },
  {
    title: "Evolution Live Baccarat",
    url: "https://www.evolution.com/games/live-baccarat/",
  },
  {
    title: "Evolution Live Roulette",
    url: "https://www.evolution.com/games/live-roulette/",
  },
  {
    title: "Evolution Game Shows",
    url: "https://www.evolution.com/games/game-shows/",
  },
];

const EVO_CATEGORY_WEIGHTS: Record<GameTypeKey, number> = {
  baccarat: 20,
  blackjack: 14,
  roulette: 20,
  dragonTiger: 2,
  sicBo: 5,
  gameShow: 30,
  poker: 6,
  other: 8,
};

const EVO_GAME_PRODUCTS: { name: string; gameType: GameTypeKey; weight: number }[] = [
  { name: "Live Blackjack", gameType: "blackjack", weight: 4 },
  { name: "Speed Blackjack", gameType: "blackjack", weight: 3 },
  { name: "Infinite Blackjack", gameType: "blackjack", weight: 3 },
  { name: "Always 6 Blackjack", gameType: "blackjack", weight: 2 },
  { name: "Infinite Fun Fun 21 Blackjack", gameType: "blackjack", weight: 2 },
  { name: "Bet Stacker Blackjack", gameType: "blackjack", weight: 2 },
  { name: "Infinite Bet Stacker Blackjack", gameType: "blackjack", weight: 2 },
  { name: "Easy Blackjack", gameType: "blackjack", weight: 2 },
  { name: "Lightning Blackjack", gameType: "blackjack", weight: 3 },
  { name: "Free Bet Blackjack", gameType: "blackjack", weight: 3 },
  { name: "Power Blackjack", gameType: "blackjack", weight: 2 },
  { name: "Blackjack Party", gameType: "blackjack", weight: 2 },
  { name: "VIP Blackjack", gameType: "blackjack", weight: 2 },
  { name: "Salon Privé Blackjack", gameType: "blackjack", weight: 1 },

  { name: "Baccarat", gameType: "baccarat", weight: 4 },
  { name: "Speed Baccarat", gameType: "baccarat", weight: 4 },
  { name: "Lightning Baccarat", gameType: "baccarat", weight: 3 },
  { name: "XXXTreme Lightning Baccarat", gameType: "baccarat", weight: 3 },
  { name: "No Commission Baccarat", gameType: "baccarat", weight: 3 },
  { name: "Live Baccarat Squeeze", gameType: "baccarat", weight: 2 },
  { name: "Live Baccarat Control Squeeze", gameType: "baccarat", weight: 2 },
  { name: "Insurance Baccarat", gameType: "baccarat", weight: 2 },
  { name: "Always 8 Baccarat", gameType: "baccarat", weight: 2 },
  { name: "Always 9 Baccarat", gameType: "baccarat", weight: 2 },
  { name: "Peek Baccarat", gameType: "baccarat", weight: 2 },
  { name: "Golden Wealth Baccarat", gameType: "baccarat", weight: 2 },
  { name: "Prosperity Tree Baccarat", gameType: "baccarat", weight: 2 },
  { name: "Salon Privé Baccarat", gameType: "baccarat", weight: 1 },

  { name: "Live European Roulette", gameType: "roulette", weight: 4 },
  { name: "Lightning Roulette", gameType: "roulette", weight: 4 },
  { name: "XXXTreme Lightning Roulette", gameType: "roulette", weight: 3 },
  { name: "Immersive Roulette", gameType: "roulette", weight: 3 },
  { name: "Speed Roulette", gameType: "roulette", weight: 3 },
  { name: "Auto Roulette", gameType: "roulette", weight: 3 },
  { name: "Instant Roulette", gameType: "roulette", weight: 3 },
  { name: "Double Ball Roulette", gameType: "roulette", weight: 2 },
  { name: "American Roulette", gameType: "roulette", weight: 2 },
  { name: "French Roulette", gameType: "roulette", weight: 2 },
  { name: "Red Door Roulette", gameType: "roulette", weight: 2 },
  { name: "MONOPOLY Roulette", gameType: "roulette", weight: 2 },
  { name: "Football Studio Roulette", gameType: "roulette", weight: 2 },
  { name: "VIP Roulette", gameType: "roulette", weight: 2 },
  { name: "Salon Privé Roulette", gameType: "roulette", weight: 1 },

  { name: "Crazy Time", gameType: "gameShow", weight: 4 },
  { name: "Lightning Storm", gameType: "gameShow", weight: 3 },
  { name: "Funky Time", gameType: "gameShow", weight: 3 },
  { name: "MONOPOLY Live", gameType: "gameShow", weight: 3 },
  { name: "MONOPOLY Big Baller", gameType: "gameShow", weight: 3 },
  { name: "Mega Ball", gameType: "gameShow", weight: 3 },
  { name: "Dream Catcher", gameType: "gameShow", weight: 2 },
  { name: "Crazy Coin Flip", gameType: "gameShow", weight: 2 },
  { name: "Ice Fishing", gameType: "gameShow", weight: 2 },
  { name: "Marble Race", gameType: "gameShow", weight: 2 },
  { name: "Crazy Balls", gameType: "gameShow", weight: 2 },
  { name: "Balloon Race", gameType: "gameShow", weight: 2 },
  { name: "Stock Market", gameType: "gameShow", weight: 2 },
  { name: "Football Studio", gameType: "gameShow", weight: 2 },
  { name: "Lightning Dice", gameType: "gameShow", weight: 2 },
  { name: "Super Color Game", gameType: "gameShow", weight: 2 },

  { name: "Dragon Tiger", gameType: "dragonTiger", weight: 3 },
  { name: "Dragon Dragon", gameType: "dragonTiger", weight: 2 },
  { name: "Lightning Dragon Tiger", gameType: "dragonTiger", weight: 2 },

  { name: "Super Sic Bo", gameType: "sicBo", weight: 3 },
  { name: "Lightning Sic Bo", gameType: "sicBo", weight: 2 },
  { name: "Mega Sic Bo", gameType: "sicBo", weight: 2 },

  { name: "Casino Hold'em", gameType: "poker", weight: 3 },
  { name: "Texas Hold'em Bonus", gameType: "poker", weight: 2 },
  { name: "Caribbean Stud Poker", gameType: "poker", weight: 2 },
  { name: "Triple Card Poker", gameType: "poker", weight: 2 },
  { name: "Teen Patti", gameType: "poker", weight: 2 },

  { name: "Fan Tan", gameType: "other", weight: 2 },
  { name: "Bac Bo", gameType: "other", weight: 2 },
  { name: "Craps", gameType: "other", weight: 2 },
  { name: "Andar Bahar", gameType: "other", weight: 2 },
  { name: "Dual Play Baccarat", gameType: "other", weight: 1 },
  { name: "Dual Play Roulette", gameType: "other", weight: 1 },
];

function buildEvolutionTables(): TableEntry[] {
  const categoryWeightSum = Object.values(EVO_CATEGORY_WEIGHTS).reduce(
    (sum, value) => sum + value,
    0,
  );
  const entries: TableEntry[] = [];
  const gameTypes = Object.keys(EVO_CATEGORY_WEIGHTS) as GameTypeKey[];
  let assignedTotal = 0;

  gameTypes.forEach((gameType, typeIndex) => {
    const products = EVO_GAME_PRODUCTS.filter((item) => item.gameType === gameType);
    if (products.length === 0) return;

    let categoryTotal: number;
    if (typeIndex === gameTypes.length - 1) {
      categoryTotal = EVO_TOTAL_TABLES - assignedTotal;
    } else {
      categoryTotal = Math.round(
        (EVO_TOTAL_TABLES * EVO_CATEGORY_WEIGHTS[gameType]) / categoryWeightSum,
      );
      assignedTotal += categoryTotal;
    }

    const productWeightSum = products.reduce((sum, item) => sum + item.weight, 0);
    let assignedInCategory = 0;

    products.forEach((product, index) => {
      let count: number;
      if (index === products.length - 1) {
        count = categoryTotal - assignedInCategory;
      } else {
        count = Math.max(1, Math.round((categoryTotal * product.weight) / productWeightSum));
        assignedInCategory += count;
      }

      entries.push(...expandTableNames(product.name, count, product.gameType));
    });
  });

  return entries;
}

export async function collectEvolutionPublicData(): Promise<PublicPlatformData> {
  const tables = buildEvolutionTables();
  const { counts, totalTables } = summarizeCounts(tables);

  return {
    platform: "evo",
    totalTables,
    counts,
    tables,
    sources: EVO_SOURCES,
    fetchedAt: new Date(),
    methodology:
      "桌台总数取自 Evolution 2024 年报（约 1,700）；各游戏名下按 evolution.com 公开产品目录分配估算桌台数。",
  };
}
