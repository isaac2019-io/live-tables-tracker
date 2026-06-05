import { buildChoiceSheetData } from "@/lib/collectors/manual/choice-2026-06-05";
import type { PublicPlatformData } from "@/lib/collectors/public-platform-data";

export async function collectChoicePublicData(): Promise<PublicPlatformData> {
  return buildChoiceSheetData();
}
