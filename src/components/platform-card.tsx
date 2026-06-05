import Link from "next/link";

import { DataSourceBadge } from "@/components/data-source-badge";
import { GameTypeBreakdown } from "@/components/game-type-breakdown";
import { Card } from "@/components/ui";
import { getPlatform, type PlatformSlug } from "@/lib/constants";
import { countsFromSnapshot } from "@/lib/snapshots";
import type { snapshots } from "@/lib/db/schema";
import { formatUtc8 } from "@/lib/timezone";

export function PlatformCard({
  platformSlug,
  snapshot,
}: {
  platformSlug: PlatformSlug;
  snapshot: typeof snapshots.$inferSelect | null;
}) {
  const platform = getPlatform(platformSlug);

  if (!snapshot) {
    return (
      <Card title={platform?.fullName ?? platformSlug}>
        <p className="text-sm text-slate-400">暂无录入数据</p>
        <Link
          href={`/platforms/${platformSlug}`}
          className="mt-4 inline-block text-sm font-bold text-orange-300 hover:text-orange-200"
        >
          查看详情 →
        </Link>
      </Card>
    );
  }
  const counts = countsFromSnapshot(snapshot);

  return (
    <Card
      title={platform?.fullName ?? snapshot.platform}
      className="flex flex-col gap-5"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              桌台总数
            </p>
            <DataSourceBadge note={snapshot.note} />
          </div>
          <p className="mt-2 text-5xl font-black text-orange-300">
            {snapshot.totalTables}
          </p>
        </div>
        <div className="text-right text-sm text-slate-400">
          <p>最后更新</p>
          <p className="font-medium text-slate-200">
            {formatUtc8(snapshot.recordedAt)}
          </p>
          <p className="text-xs text-slate-500">UTC+8</p>
        </div>
      </div>

      <GameTypeBreakdown counts={counts} total={snapshot.totalTables} />

      <Link
        href={`/platforms/${snapshot.platform}`}
        className="text-sm font-bold text-orange-300 hover:text-orange-200"
      >
        查看详情 →
      </Link>
    </Card>
  );
}
