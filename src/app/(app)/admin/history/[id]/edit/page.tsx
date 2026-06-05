import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { SnapshotEntryForm } from "@/components/snapshot-entry-form";
import { PageShell } from "@/components/ui";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { snapshots } from "@/lib/db/schema";
import { countsFromSnapshot } from "@/lib/snapshots";
import { formatUtc8ForInput } from "@/lib/timezone";

type EditSnapshotPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSnapshotPage({ params }: EditSnapshotPageProps) {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/");
  }

  const { id } = await params;
  const snapshotId = Number(id);
  if (!Number.isFinite(snapshotId)) notFound();

  const db = await getDb();
  const [row] = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.id, snapshotId))
    .limit(1);

  if (!row) notFound();

  return (
    <PageShell title={`编辑快照 #${row.id}`} description="修改后会自动重算相关日期汇总。">
      <SnapshotEntryForm
        mode="edit"
        initial={{
          id: row.id,
          platform: row.platform,
          recordedAt: formatUtc8ForInput(row.recordedAt),
          counts: countsFromSnapshot(row),
          note: row.note,
        }}
      />
    </PageShell>
  );
}
