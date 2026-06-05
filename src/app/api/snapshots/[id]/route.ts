import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import {
  recomputeDailyForDate,
  recomputeDailyForSnapshotDate,
} from "@/lib/aggregates";
import { writeAuditLog } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { snapshots } from "@/lib/db/schema";
import {
  buildSnapshotPayload,
  snapshotInputSchema,
} from "@/lib/snapshots";
import { parseUtc8DateTime, toUtc8DateString } from "@/lib/timezone";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const snapshotId = Number(id);

    if (!Number.isFinite(snapshotId)) {
      return NextResponse.json({ error: "无效 ID" }, { status: 400 });
    }

    const body = snapshotInputSchema.parse(await request.json());
    const recordedAt = parseUtc8DateTime(body.recordedAt);
    const payload = buildSnapshotPayload(
      body.platform,
      recordedAt,
      body.counts,
      body.note,
    );

    const db = await getDb();
    const [existing] = await db
      .select()
      .from(snapshots)
      .where(eq(snapshots.id, snapshotId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    const [updated] = await db
      .update(snapshots)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(snapshots.id, snapshotId))
      .returning();

    await writeAuditLog({
      userId: session.id,
      action: "update",
      entityType: "snapshot",
      entityId: snapshotId,
      payload: { before: existing, after: updated },
    });

    await recomputeDailyForDate(toUtc8DateString(existing.recordedAt));
    await recomputeDailyForSnapshotDate(recordedAt);

    return NextResponse.json({ snapshot: updated });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "未登录" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "无权限" }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const snapshotId = Number(id);

    if (!Number.isFinite(snapshotId)) {
      return NextResponse.json({ error: "无效 ID" }, { status: 400 });
    }

    const db = await getDb();
    const [existing] = await db
      .select()
      .from(snapshots)
      .where(eq(snapshots.id, snapshotId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    await db.delete(snapshots).where(eq(snapshots.id, snapshotId));

    await writeAuditLog({
      userId: session.id,
      action: "delete",
      entityType: "snapshot",
      entityId: snapshotId,
      payload: existing,
    });

    await recomputeDailyForDate(toUtc8DateString(existing.recordedAt));

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "未登录" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "无权限" }, { status: 403 });
      }
    }

    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
