import { collectDbDataFromLobbyUrl } from "@/lib/collectors/db-public";
import { upsertPublicSnapshot } from "@/lib/collectors/sync-public";
import type { DbHallSlug } from "@/lib/constants";
import { ensureSystemUser } from "@/lib/system-user";

export type DbSyncResult = {
  totalTables: number;
  counts: Awaited<ReturnType<typeof collectDbDataFromLobbyUrl>>["counts"];
  halls: Partial<Record<DbHallSlug, number>>;
  snapshotId: number;
  recordedAt: string;
  sources: { title: string; url?: string }[];
};

export async function syncDbFromLobbyUrl(
  lobbyUrl: string,
  options?: { userId?: number },
): Promise<DbSyncResult> {
  const userId = options?.userId ?? (await ensureSystemUser());
  const data = await collectDbDataFromLobbyUrl(lobbyUrl.trim());
  const snapshot = await upsertPublicSnapshot(data, userId);

  const halls: Partial<Record<DbHallSlug, number>> = {};
  for (const table of data.tables) {
    if (!table.hall) continue;
    halls[table.hall] = (halls[table.hall] ?? 0) + 1;
  }

  return {
    totalTables: data.totalTables,
    counts: data.counts,
    halls,
    snapshotId: snapshot.id,
    recordedAt: snapshot.recordedAt.toISOString(),
    sources: data.sources,
  };
}
