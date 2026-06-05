import { classifyGameName } from "@/lib/collectors/game-type-mapper";
import type { PublicPlatformData } from "@/lib/collectors/public-platform-data";
import {
  expandTableNames,
  mergeTableEntries,
  summarizeCounts,
  type TableEntry,
} from "@/lib/table-entries";

const PRAGMATIC_SOURCES = [
  {
    title: "Pragmatic Play Live Casino",
    url: "https://www.pragmaticplay.com/en/live-casino/",
  },
  {
    title: "Pragmatic Play Live Dealer Games (OnlineCasinos.net)",
    url: "https://www.onlinecasinos.net/casino-software-providers/pragmatic-play/live-dealer-games/",
  },
];

const PRAGMATIC_SPECIFIC_TABLES: { name: string; count?: number }[] = [
  { name: "Auto Mega Roulette" },
  { name: "Vegas Ball Bonanza" },
  { name: "Speed Auto-Roulette 1" },
  { name: "Privé Lounge Blackjack 1" },
  { name: "Privé Lounge Blackjack 2" },
  { name: "Privé Lounge Blackjack 3" },
  { name: "Privé Lounge Blackjack 4" },
  { name: "Privé Lounge Blackjack 5" },
  { name: "Snakes & Ladders Live" },
  { name: "Mega Baccarat" },
  { name: "Mega Roulette" },
  { name: "Mega Wheel" },
  { name: "PowerUP Roulette" },
  { name: "Boom City" },
  { name: "Super 8 Baccarat" },
  { name: "Sweet Bonanza CandyLand" },
  { name: "Andar Bahar 1" },
  { name: "Andar Bahar 2" },
  { name: "Dragon Tiger 1" },
  { name: "Dragon Tiger 2" },
  { name: "ONE Blackjack" },
  { name: "Blackjack 74 - Ruby" },
  { name: "No Comm Baccarat 1" },
  { name: "Speed Baccarat 2 - Korean" },
  { name: "Mega Sic Bo" },
  { name: "Gates of Olympus Roulette" },
  { name: "Mega Roulette 3000" },
  { name: "Money Time" },
  { name: "The Bingo Spot" },
  { name: "Fortune Roulette" },
  { name: "Dice City" },
  { name: "Mega Sic Bac" },
];

const PRAGMATIC_BULK_GROUPS = [
  { label: "Blackjack", count: 73, gem: "Ruby" },
  { label: "Speed Blackjack", count: 22, gem: "Emerald" },
  { label: "VIP Blackjack", count: 8, gem: "Emerald" },
  { label: "Free Bet Blackjack", count: 4 },
  { label: "Blackjack X", count: 6 },
  { label: "Bet Behind Pro Blackjack", count: 3 },
  { label: "Roulette", count: 18 },
  { label: "Auto Roulette", count: 6 },
  { label: "Speed Roulette", count: 4 },
  { label: "Fortune Roulette Extra", count: 1 },
  { label: "No Commission Baccarat", count: 11 },
  { label: "Speed Baccarat", count: 15 },
];

function expandGemTables(label: string, count: number, gem?: string): TableEntry[] {
  const gameType = classifyGameName(label);
  return Array.from({ length: count }, (_, index) => ({
    name: gem ? `${label} ${index + 1} - ${gem}` : `${label} ${index + 1}`,
    gameType,
  }));
}

function buildSpecificTables(): TableEntry[] {
  return PRAGMATIC_SPECIFIC_TABLES.map((item) => ({
    name: item.name,
    gameType: classifyGameName(item.name),
  }));
}

function buildBulkTables(): TableEntry[] {
  return mergeTableEntries(
    PRAGMATIC_BULK_GROUPS.map((group) =>
      expandGemTables(group.label, group.count, group.gem),
    ),
  );
}

async function fetchPragmaticCatalogTitles(): Promise<string[]> {
  try {
    const response = await fetch("https://www.pragmaticplay.com/en/live-casino/", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "LiveTablesTracker/1.0" },
    });
    if (!response.ok) return [];

    const html = await response.text();
    const titles = new Set<string>();
    const headingMatches = html.matchAll(/<h[34][^>]*>([^<]+)<\/h[34]>/gi);

    for (const match of headingMatches) {
      const title = match[1].replace(/\s+/g, " ").trim();
      if (title.length > 2 && !/about|key features|games|technology/i.test(title)) {
        titles.add(title);
      }
    }

    return [...titles];
  } catch {
    return [];
  }
}

function appendCatalogOnlyTables(
  tables: TableEntry[],
  catalogTitles: string[],
): TableEntry[] {
  const existing = new Set(tables.map((table) => table.name.toLowerCase()));
  const extras: TableEntry[] = [];

  for (const title of catalogTitles) {
    const normalized = title.toLowerCase();
    if ([...existing].some((name) => name.includes(normalized) || normalized.includes(name))) {
      continue;
    }
    extras.push({ name: title, gameType: classifyGameName(title) });
    existing.add(normalized);
  }

  return [...tables, ...extras];
}

function buildPragmaticTables(catalogTitles: string[]): TableEntry[] {
  const base = [...buildSpecificTables(), ...buildBulkTables()];
  return appendCatalogOnlyTables(base, catalogTitles);
}

export async function collectPragmaticPublicData(): Promise<PublicPlatformData> {
  const catalogTitles = await fetchPragmaticCatalogTitles();
  const tables = buildPragmaticTables(catalogTitles);
  const { counts, totalTables } = summarizeCounts(tables);

  return {
    platform: "pragmatic",
    totalTables,
    counts,
    tables,
    sources: PRAGMATIC_SOURCES,
    fetchedAt: new Date(),
    methodology:
      "基于 Pragmatic Play 官网目录与 OnlineCasinos.net 公开桌台名称汇总；批量桌台按命名规则展开为具体桌台名。",
  };
}
