import { syncPublicPlatformData } from "@/lib/collectors/sync-public";
import { getLatestSnapshots, getSnapshotTables } from "@/lib/queries";

const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;

function isPublicSnapshot(note: string | null | undefined) {
  return Boolean(note?.startsWith("[公开数据]"));
}

function isStale(recordedAt: Date) {
  return Date.now() - recordedAt.getTime() > SYNC_INTERVAL_MS;
}

export async function ensurePublicDataSynced() {
  const latest = await getLatestSnapshots();
  const checks = await Promise.all(
    latest.map(async ({ snapshot }) => {
      if (!snapshot) return true;
      if (!isPublicSnapshot(snapshot.note)) return true;
      if (isStale(snapshot.recordedAt)) return true;
      const tables = await getSnapshotTables(snapshot.id);
      return tables.length === 0;
    }),
  );

  if (!checks.some(Boolean)) return null;
  return syncPublicPlatformData();
}
