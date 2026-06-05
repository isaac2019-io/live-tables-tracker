import Link from "next/link";
import { notFound } from "next/navigation";

import { aggregateGameTypeAverages } from "@/lib/aggregates";
import { Card, EmptyState, PageShell, StatCard } from "@/components/ui";
import { GAME_TYPES, PLATFORMS, type GameTypeKey } from "@/lib/constants";
import {
  getDailyAggregatesForDate,
  getSnapshotsForDay,
} from "@/lib/queries";
import {
  formatUtc8,
  isValidDateString,
  utc8DayRangeLabel,
} from "@/lib/timezone";
import { subDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { TIMEZONE } from "@/lib/constants";
import { RecomputeButton } from "@/components/recompute-button";
import { getSession } from "@/lib/auth/session";

type DailyDetailPageProps = {
  params: Promise<{ date: string }>;
};

export default async function DailyDetailPage({ params }: DailyDetailPageProps) {
  const { date } = await params;
  if (!isValidDateString(date)) notFound();

  const session = await getSession();
  const aggregates = await getDailyAggregatesForDate(date);
  const previousDate = formatInTimeZone(
    subDays(new Date(`${date}T12:00:00+08:00`), 1),
    TIMEZONE,
    "yyyy-MM-dd",
  );
  const previousAggregates = await getDailyAggregatesForDate(previousDate);
  const snapshots = await getSnapshotsForDay(date);

  const hasData = aggregates.some((item) => item.aggregate) || snapshots.length > 0;

  return (
    <PageShell
      title={`${date} 每日汇总`}
      description={utc8DayRangeLabel(date)}
      actions={
        <>
          <Link
            href="/daily"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:border-orange-300/60 hover:bg-white/10"
          >
            返回列表
          </Link>
          {session?.role === "admin" ? <RecomputeButton date={date} /> : null}
        </>
      }
    >
      {!hasData ? (
        <EmptyState message="该日期暂无录入或汇总数据。" />
      ) : (
        <div className="grid gap-6">
          {aggregates.map((item) => {
            const platform = PLATFORMS.find((p) => p.slug === item.platform);
            const previous = previousAggregates.find(
              (row) => row.platform === item.platform,
            )?.aggregate;
            const aggregate = item.aggregate;

            if (!aggregate) {
              return (
                <Card key={item.platform} title={platform?.fullName}>
                  <p className="text-sm text-slate-400">当日无汇总数据</p>
                </Card>
              );
            }

            const dayOverDay =
              previous && previous.totalAvg > 0
                ? aggregate.totalAvg - previous.totalAvg
                : null;

            return (
              <Card key={item.platform} title={platform?.fullName}>
                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard label="日初桌台" value={aggregate.totalOpen} />
                  <StatCard label="日末桌台" value={aggregate.totalClose} />
                  <StatCard label="日均桌台" value={aggregate.totalAvg} />
                  <StatCard
                    label="日环比"
                    value={
                      dayOverDay === null
                        ? "—"
                        : `${dayOverDay > 0 ? "+" : ""}${dayOverDay}`
                    }
                    hint={
                      dayOverDay === null
                        ? "前一日无数据"
                        : `对比 ${previousDate}`
                    }
                  />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <StatCard label="日峰" value={aggregate.totalMax} hint={aggregate.peakAt ? formatUtc8(aggregate.peakAt) : undefined} />
                  <StatCard label="日谷" value={aggregate.totalMin} hint={aggregate.troughAt ? formatUtc8(aggregate.troughAt) : undefined} />
                  <StatCard label="录入次数" value={aggregate.snapshotCount} />
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      <tr>
                        <th className="px-3 py-2">游戏类型</th>
                        <th className="px-3 py-2">日均</th>
                        <th className="px-3 py-2">最小</th>
                        <th className="px-3 py-2">最大</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GAME_TYPES.map((game) => {
                        const metric = aggregateGameTypeAverages(
                          aggregate,
                          game.key as GameTypeKey,
                        );
                        return (
                          <tr key={game.key} className="border-t border-white/10">
                            <td className="px-3 py-2 text-slate-200">
                              {game.labelZh}
                            </td>
                            <td className="px-3 py-2 font-semibold text-white">
                              {metric.avg}
                            </td>
                            <td className="px-3 py-2 text-slate-400">
                              {metric.min}
                            </td>
                            <td className="px-3 py-2 text-slate-400">
                              {metric.max}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}

          <Card title="当日录入记录">
            {snapshots.length === 0 ? (
              <p className="text-sm text-slate-400">当日无原始录入记录。</p>
            ) : (
              <div className="space-y-3">
                {snapshots.map((row) => (
                  <div
                    key={row.snapshot.id}
                    className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {PLATFORMS.find((p) => p.slug === row.snapshot.platform)?.label} ·{" "}
                        {row.snapshot.totalTables} 桌
                      </p>
                      <p className="text-sm text-slate-400">
                        {formatUtc8(row.snapshot.recordedAt)} · {row.creatorEmail}
                      </p>
                    </div>
                    {row.snapshot.note ? (
                      <p className="text-sm text-slate-300">{row.snapshot.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </PageShell>
  );
}
