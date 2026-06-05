import { PlatformCard } from "@/components/platform-card";
import { Card, PageShell, StatCard } from "@/components/ui";
import { ensurePublicDataSynced } from "@/lib/collectors/ensure-public-data";
import { PLATFORMS } from "@/lib/constants";
import { getLatestSnapshots } from "@/lib/queries";
import { formatUtc8 } from "@/lib/timezone";

export default async function DashboardPage() {
  await ensurePublicDataSynced();
  const latest = await getLatestSnapshots();
  const totalTables = latest.reduce(
    (sum, item) => sum + (item.snapshot?.totalTables ?? 0),
    0,
  );
  const latestUpdate = latest
    .map((item) => item.snapshot?.recordedAt)
    .filter(Boolean)
    .sort((a, b) => (b?.getTime() ?? 0) - (a?.getTime() ?? 0))[0];

  return (
    <PageShell
      eyebrow="DB · Evo · Pragmatic · Choice 桌台监控"
      title="实时总览"
      description="无需登录即可查看。数据优先从公开资料或手工统计表汇总，管理员也可人工录入覆盖。"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="平台桌台合计" value={totalTables} />
        <StatCard
          label="已接入平台"
          value={PLATFORMS.length}
          hint="Evolution · Pragmatic · Choice · DB"
        />
        <StatCard
          label="最近更新时间"
          value={latestUpdate ? formatUtc8(latestUpdate, "MM-dd HH:mm") : "—"}
          hint="UTC+8"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {latest.map((item) => (
          <PlatformCard
            key={item.platform}
            platformSlug={item.platform}
            snapshot={item.snapshot}
          />
        ))}
      </div>

      <Card title="对比摘要">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {latest.map((item) => {
            const platform = PLATFORMS.find((p) => p.slug === item.platform);
            return (
              <div
                key={item.platform}
                className="rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-orange-300/40"
              >
                <p className="text-sm text-slate-400">{platform?.fullName}</p>
                <p className="mt-2 text-3xl font-black text-orange-300">
                  {item.snapshot?.totalTables ?? 0}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </PageShell>
  );
}
