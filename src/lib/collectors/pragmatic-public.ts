import { buildPragmaticSheetData } from "@/lib/collectors/manual/pragmatic-2026-06-05";
import type { PublicPlatformData } from "@/lib/collectors/public-platform-data";

export async function collectPragmaticPublicData(): Promise<PublicPlatformData> {
  return buildPragmaticSheetData();
}
