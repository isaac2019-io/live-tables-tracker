import { classifyGameName } from "@/lib/collectors/game-type-mapper";
import type { PublicPlatformData } from "@/lib/collectors/public-platform-data";
import {
  expandTableNames,
  mergeTableEntries,
  summarizeCounts,
  type TableEntry,
} from "@/lib/table-entries";

const CHOICE_SOURCES = [
  {
    title: "Choice Gaming — AI Live Casino (iGB)",
    url: "https://igamingbusiness.com/company-news/choice-gaming-redefines-igaming-with-ai-live-casino-and-global-collaborations/",
  },
  {
    title: "KISS AI Live Casino launch (G3 Newswire)",
    url: "https://g3newswire.com/kiss-ai-live-casino-launches-as-the-industrys-first-ai-first-live-casino-studio/",
  },
  {
    title: "Choice Gaming & KISS AI at Harmony Choice (LCB)",
    url: "https://lcb.org/news/betconstruct-ai-launches-choice-gaming-and-kiss-ai-live-casino",
  },
];

const KISS_ROULETTE_DEALERS = ["Alisa", "Charlie", "Defne", "Maria", "Rose", "Seo-Yan"];

const CHOICE_SPECIFIC_TABLES: { name: string; gameType?: "roulette" | "sicBo" }[] = [
  { name: "Evra Sic Bo", gameType: "sicBo" },
];

function buildKissRouletteTables(): TableEntry[] {
  return KISS_ROULETTE_DEALERS.map((dealer) => ({
    name: `KISS Roulette AI ${dealer}`,
    gameType: "roulette" as const,
  }));
}

function buildKissSicBoTables(): TableEntry[] {
  return expandTableNames("KISS Sic Bo", 4, "sicBo");
}

function buildChoiceTables(): TableEntry[] {
  const specific = CHOICE_SPECIFIC_TABLES.map((item) => ({
    name: item.name,
    gameType: item.gameType ?? classifyGameName(item.name),
  }));

  return mergeTableEntries([
    buildKissRouletteTables(),
    buildKissSicBoTables(),
    specific,
  ]);
}

export async function collectChoicePublicData(): Promise<PublicPlatformData> {
  const tables = buildChoiceTables();
  const { counts, totalTables } = summarizeCounts(tables);

  return {
    platform: "choice",
    totalTables,
    counts,
    tables,
    sources: CHOICE_SOURCES,
    fetchedAt: new Date(),
    methodology:
      "基于 Choice Gaming / KISS AI Live Casino 公开发布信息汇总：6 张 AI 轮盘桌（Alisa、Charlie、Defne、Maria、Rose、Seo-Yan）、Evra Sic Bo 及多款 KISS Sic Bo 桌；不含 slots / crash 非 live 桌台。",
  };
}
