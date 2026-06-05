import type { DbHallSlug } from "@/lib/constants";

/** DB 前端 gameCasinoId（厅类型枚举 Ut）到本站 hall slug 的映射 */
export const DB_CASINO_HALL_MAP: Record<number, DbHallSlug> = {
  1: "flagship", // 旗舰厅 FLAG_SHIP
  5: "international", // 国际厅 INTL_CASINO
  9: "asia-pacific", // 亚太厅 NEW_THOROUGH
  12: "vietnam", // 越南厅 VIETNAM_HALL
  4: "europe", // 欧洲厅 UKRAINE_CASINO
  7: "americas", // 美洲厅 AMERICAN
  13: "ebet", // 电投厅 DT_HALL
};

export function mapDbCasinoHall(gameCasinoId: number): DbHallSlug | null {
  return DB_CASINO_HALL_MAP[gameCasinoId] ?? null;
}
