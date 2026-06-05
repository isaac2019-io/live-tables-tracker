import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { importSnapshotsFromCsv } from "@/lib/import-snapshot";

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请上传 CSV 文件" }, { status: 400 });
    }

    const content = await file.text();
    const snapshots = await importSnapshotsFromCsv(content, session.id);

    await writeAuditLog({
      userId: session.id,
      action: "import",
      entityType: "snapshot",
      payload: {
        fileName: file.name,
        snapshotIds: snapshots.map((item) => item.id),
      },
    });

    return NextResponse.json({
      ok: true,
      imported: snapshots.length,
      snapshots,
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
