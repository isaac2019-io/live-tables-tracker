import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import {
  importSnapshotBundle,
  snapshotBundleSchema,
} from "@/lib/snapshot-transfer";

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const contentType = request.headers.get("content-type") ?? "";

    let raw: unknown;
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "请上传 JSON 文件" }, { status: 400 });
      }
      raw = JSON.parse(await file.text());
    } else {
      raw = await request.json();
    }

    const bundle = snapshotBundleSchema.parse(raw);
    const created = await importSnapshotBundle(bundle, session.id);

    await writeAuditLog({
      userId: session.id,
      action: "import",
      entityType: "snapshot_bundle",
      payload: {
        exportedAt: bundle.exportedAt,
        platforms: created.map((item) => item.platform),
        snapshotIds: created.map((item) => item.id),
      },
    });

    return NextResponse.json({
      ok: true,
      imported: created.length,
      platforms: created.map((item) => ({
        platform: item.platform,
        snapshotId: item.id,
        totalTables: item.totalTables,
      })),
    });
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

    return NextResponse.json({ error: "导入失败" }, { status: 500 });
  }
}
