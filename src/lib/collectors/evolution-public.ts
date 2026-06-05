import { buildEvoSheetData } from "@/lib/collectors/manual/evo-2026-05-05";
import type { PublicPlatformData } from "@/lib/collectors/public-platform-data";

export async function collectEvolutionPublicData(): Promise<PublicPlatformData> {
  return buildEvoSheetData();
}
