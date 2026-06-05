import Link from "next/link";
import { redirect } from "next/navigation";

import { HistoryActions } from "@/components/history-actions";
import { Card, EmptyState, PageShell } from "@/components/ui";
import { PLATFORMS } from "@/lib/constants";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { snapshots, users } from "@/lib/db/schema";
import { formatUtc8 } from "@/lib/timezone";
import { desc, eq } from "drizzle-orm";

export default async function AdminHistoryPage() {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/");
  }

  const db = await getDb();
  const rows = await db
    .select({
      snapshot: snapshots,
      creatorEmail: users.email,
    })
    .from(snapshots)
    .innerJoin(users, eq(users.id, snapshots.createdBy))
    .orderBy(desc(snapshots.recordedAt))
    .limit(100);

  return (
    <PageShell
      title="录入历史"
      description="查看、编辑或删除最近 100 条快照。删除与修改会自动重算对应 UTC+8 日期汇总。"
      actions={
        <Link
          href="/admin/entry"
          className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-black text-black shadow-[0_0_35px_rgba(249,115,22,0.35)] transition hover:bg-orange-300"
        >
          新增录入
        </Link>
      }
    >
      <Card>
        {rows.length === 0 ? (
          <EmptyState message="暂无录入记录。" />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.snapshot.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-4 transition hover:border-orange-300/30 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="font-semibold text-white">
                    #{row.snapshot.id} ·{" "}
                    {PLATFORMS.find((p) => p.slug === row.snapshot.platform)?.fullName} ·{" "}
                    {row.snapshot.totalTables} 桌
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatUtc8(row.snapshot.recordedAt)} (UTC+8) ·{" "}
                    {row.creatorEmail}
                  </p>
                  {row.snapshot.note ? (
                    <p className="mt-2 text-sm text-slate-300">{row.snapshot.note}</p>
                  ) : null}
                </div>
                <HistoryActions snapshotId={row.snapshot.id} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageShell>
  );
}
