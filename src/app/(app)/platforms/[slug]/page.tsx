import { notFound } from "next/navigation";

import { GameTypeBreakdown } from "@/components/game-type-breakdown";
import { TableDirectory } from "@/components/table-directory";
import { TrendChart } from "@/components/trend-chart";
import { Card, EmptyState, PageShell, StatCard } from "@/components/ui";
import { ensurePublicDataSynced } from "@/lib/collectors/ensure-public-data";
import { getPlatform, isPlatformSlug } from "@/lib/constants";
import {
  getLatestSnapshot,
  getLatestSnapshotTables,
  getSnapshotsInRange,
} from "@/lib/queries";
import { countsFromSnapshot } from "@/lib/snapshots";
import { formatUtc8, recentUtc8Dates } from "@/lib/timezone";

type PlatformPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { slug } = await params;
  if (!isPlatformSlug(slug)) notFound();

  await ensurePublicDataSynced();
  const platform = getPlatform(slug);
  const latest = await getLatestSnapshot(slug);
  const tableRows = latest ? await getLatestSnapshotTables(slug) : [];
  const dates = recentUtc8Dates(30);
  const trendRows = await getSnapshotsInRange(
    slug,
    dates[dates.length - 1],
    dates[0],
  );

  return (
    <PageShell
      title={platform?.fullName ?? slug}
      description="平台最新快照、游戏类型分布与近 30 天桌台总数趋势。"
    >
      {!latest ? (
        <EmptyState message="该平台尚无录入数据，请由管理员在「录入」页面添加。" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="当前桌台总数" value={latest.totalTables} />
            <StatCard
              label="最后更新"
              value={formatUtc8(latest.recordedAt, "MM-dd HH:mm")}
              hint="UTC+8"
            />
            <StatCard
              label="数据来源"
              value={latest.note?.startsWith("[公开数据]") ? "公开汇总" : "人工录入"}
              hint={latest.note?.replace(/^\[公开数据\]\s*/, "").slice(0, 80) || "无备注"}
            />
          </div>

          <Card title="游戏类型分布">
            <GameTypeBreakdown
              counts={countsFromSnapshot(latest)}
              total={latest.totalTables}
            />
          </Card>

          <Card title={`桌台明细（${tableRows.length} 张）`}>
            <TableDirectory tables={tableRows} />
          </Card>
        </>
      )}

      <Card title="近 30 天桌台总数趋势">
        <TrendChart rows={trendRows} />
      </Card>
    </PageShell>
  );
}
