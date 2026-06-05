import type { GameTypeCounts, PlatformSlug } from "@/lib/constants";
import type { TableEntry } from "@/lib/table-entries";

export type PublicPlatformData = {
  platform: PlatformSlug;
  totalTables: number;
  counts: GameTypeCounts;
  tables: TableEntry[];
  sources: { title: string; url: string }[];
  recordedAt: Date;
  fetchedAt: Date;
  methodology: string;
};
