import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { recomputeDailyForSnapshotDate } from "@/lib/aggregates";
import { writeAuditLog } from "@/lib/audit";
import { requireAdmin, requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { snapshots, users } from "@/lib/db/schema";
import {
  buildSnapshotPayload,
  snapshotInputSchema,
} from "@/lib/snapshots";
import { parseUtc8DateTime } from "@/lib/timezone";

export async function GET() {
  try {
    await requireSession();
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

    return NextResponse.json({ snapshots: rows });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "读取失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = snapshotInputSchema.parse(await request.json());
    const recordedAt = parseUtc8DateTime(body.recordedAt);

    const payload = buildSnapshotPayload(
      body.platform,
      recordedAt,
      body.counts,
      body.note,
    );

    const db = await getDb();
    const [created] = await db
      .insert(snapshots)
      .values({
        ...payload,
        createdBy: session.id,
        updatedAt: new Date(),
      })
      .returning();

    await writeAuditLog({
      userId: session.id,
      action: "create",
      entityType: "snapshot",
      entityId: created.id,
      payload,
    });

    await recomputeDailyForSnapshotDate(recordedAt);

    return NextResponse.json({ snapshot: created });
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

    return NextResponse.json({ error: "录入失败" }, { status: 500 });
  }
}
