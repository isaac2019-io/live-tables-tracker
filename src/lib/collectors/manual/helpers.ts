import type {
  DbHallSlug,
  GameTypeCounts,
  GameTypeKey,
  PlatformSlug,
} from "@/lib/constants";
import type { PublicPlatformData } from "@/lib/collectors/public-platform-data";
import { parseUtc8DateTime } from "@/lib/timezone";
import {
  expandTableNames,
  mergeTableEntries,
  summarizeCounts,
  type TableEntry,
} from "@/lib/table-entries";

export type SheetSection = {
  label: string;
  gameType: GameTypeKey;
  hall?: DbHallSlug;
  count?: number;
  tableIds?: string[];
};

export function expandTableIds(
  label: string,
  tableIds: string[],
  gameType: GameTypeKey,
  hall?: DbHallSlug,
): TableEntry[] {
  return tableIds.map((id) => ({
    name: `${label} ${id}`,
    gameType,
    ...(hall ? { hall } : {}),
  }));
}

export function buildTablesFromSections(sections: SheetSection[]): TableEntry[] {
  return mergeTableEntries(
    sections.map((section) => {
      if (section.tableIds?.length) {
        return expandTableIds(
          section.label,
          section.tableIds,
          section.gameType,
          section.hall,
        );
      }
      return expandTableNames(
        section.label,
        section.count ?? 0,
        section.gameType,
      ).map((entry) => ({
        ...entry,
        ...(section.hall ? { hall: section.hall } : {}),
      }));
    }),
  );
}

export function buildManualPlatformData({
  platform,
  sheetDate,
  sheetTitle,
  counts,
  tables,
  sources,
}: {
  platform: PlatformSlug;
  sheetDate: string;
  sheetTitle: string;
  counts: GameTypeCounts;
  tables: TableEntry[];
  sources: { title: string; url?: string }[];
}): PublicPlatformData {
  const totalTables = Object.values(counts).reduce((sum, value) => sum + value, 0);

  if (tables.length !== totalTables) {
    throw new Error(
      `${platform} table rows (${tables.length}) do not match sheet total (${totalTables})`,
    );
  }

  const summarized = summarizeCounts(tables);
  for (const key of Object.keys(counts) as GameTypeKey[]) {
    if (summarized.counts[key] !== counts[key]) {
      throw new Error(
        `${platform} ${key} count mismatch: sheet=${counts[key]} tables=${summarized.counts[key]}`,
      );
    }
  }

  return {
    platform,
    totalTables,
    counts,
    tables,
    sources: sources.map((source) => ({
      title: source.title,
      url: source.url ?? "",
    })),
    recordedAt: parseUtc8DateTime(`${sheetDate}T12:00`),
    fetchedAt: new Date(),
    methodology: `手工统计表录入（${sheetTitle}，统计日 ${sheetDate}，UTC+8）`,
  };
}
