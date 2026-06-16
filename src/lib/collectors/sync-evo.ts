import { fetchEvoLobbyTables, type EvoLoginCredentials } from "@/lib/collectors/evo/fetch-lobby";
import { upsertPublicSnapshot } from "@/lib/collectors/sync-public";

export type EvoSyncResult = {
  totalTables: number;
  counts: Awaited<ReturnType<typeof fetchEvoLobbyTables>>["counts"];
  snapshotId: number;
  recordedAt: string;
  sample: { name: string; gameType: string }[];
};

export async function syncEvoFromCredentials(
  credentials: EvoLoginCredentials,
  options?: { userId?: number },
): Promise<EvoSyncResult> {
  const { ensureSystemUser } = await import("@/lib/system-user");
  const userId = options?.userId ?? (await ensureSystemUser());

  const result = await fetchEvoLobbyTables(credentials);
  const fetchedAt = new Date();
  const snapshot = await upsertPublicSnapshot(
    {
      platform: "evo",
      totalTables: result.totalTables,
      counts: result.counts,
      tables: result.tables,
      sources: [
        {
          title: "Evolution 大厅实时采集",
          url: credentials.loginUrl,
        },
      ],
      recordedAt: fetchedAt,
      fetchedAt,
      methodology:
        "Playwright 登录代理站并进入 EVO 真人，拦截 Evolution WebSocket lobby.configs 汇总桌台与游戏类型",
    },
    userId,
  );

  return {
    totalTables: result.totalTables,
    counts: result.counts,
    snapshotId: snapshot.id,
    recordedAt: snapshot.recordedAt.toISOString(),
    sample: result.tables.slice(0, 8).map((t) => ({ name: t.name, gameType: t.gameType })),
  };
}
