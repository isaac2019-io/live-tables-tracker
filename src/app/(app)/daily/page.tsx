import Link from "next/link";

import { Card, EmptyState, PageShell } from "@/components/ui";
import { PLATFORMS } from "@/lib/constants";
import { getRecentDailySummaries } from "@/lib/queries";
import { todayUtc8String } from "@/lib/timezone";

export default async function DailyIndexPage() {
  const summaries = await getRecentDailySummaries(14).then((rows) => rows.reverse());
  const today = todayUtc8String();

  return (
    <PageShell
      title="每日汇总"
      description="按 UTC+8 自然日汇总桌台总数。点击日期查看详情、分类型均值与环比。"
      actions={
        <Link
          href={`/daily/${today}`}
          className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-black text-black shadow-[0_0_35px_rgba(249,115,22,0.35)] transition hover:bg-orange-300"
        >
          查看今日
        </Link>
      }
    >
      <Card title="近 14 天概览">
        {summaries.length === 0 ? (
          <EmptyState message="暂无日汇总数据。录入快照后会自动生成。" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-3 py-3">日期 (UTC+8)</th>
                  {PLATFORMS.map((platform) => (
                    <th key={platform.slug} className="px-3 py-3">
                      {platform.label}
                    </th>
                  ))}
                  <th className="px-3 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((summary) => (
                  <tr key={summary.date} className="border-t border-white/10">
                    <td className="px-3 py-3 font-medium text-white">
                      {summary.date}
                    </td>
                    {summary.aggregates.map((item) => (
                      <td key={item.platform} className="px-3 py-3 text-slate-300">
                        {item.aggregate ? (
                          <div>
                            <p className="font-semibold text-white">
                              日均 {item.aggregate.totalAvg}
                            </p>
                            <p className="text-xs text-slate-500">
                              峰 {item.aggregate.totalMax} / 谷{" "}
                              {item.aggregate.totalMin}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-3">
                      <Link
                        href={`/daily/${summary.date}`}
                        className="font-bold text-orange-300 hover:text-orange-200"
                      >
                        详情
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageShell>
  );
}
