import { fetchDbLobbyTables } from "@/lib/collectors/db/fetch-lobby";
import { buildDbSheetData } from "@/lib/collectors/manual/db-2026-06-05";
import type { PublicPlatformData } from "@/lib/collectors/public-platform-data";

function resolveDbLobbyUrl(): string | null {
  const url = process.env.DB_LOBBY_URL?.trim();
  return url || null;
}

async function collectDbLiveData(lobbyUrl: string): Promise<PublicPlatformData> {
  const result = await fetchDbLobbyTables(lobbyUrl);
  const fetchedAt = new Date();

  return {
    platform: "db",
    totalTables: result.totalTables,
    counts: result.counts,
    tables: result.tables,
    sources: [
      {
        title: "DB 真人大厅实时采集",
        url: lobbyUrl.split("?")[0],
      },
    ],
    recordedAt: fetchedAt,
    fetchedAt,
    methodology:
      "Playwright 打开签名大厅链接，拦截 WebSocket 桌台列表（协议 10053），按旗舰/国际/亚太/越南/欧洲/美洲/电投七厅汇总",
  };
}

export async function collectDbPublicData(): Promise<PublicPlatformData> {
  const lobbyUrl = resolveDbLobbyUrl();
  if (lobbyUrl) {
    try {
      return await collectDbLiveData(lobbyUrl);
    } catch (error) {
      console.error("[db-collector] live failed, using manual sheet:", error);
    }
  }

  return buildDbSheetData();
}

export function isDbCollectorConfigured(): boolean {
  return Boolean(resolveDbLobbyUrl());
}
