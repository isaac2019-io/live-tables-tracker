import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import {
  buildLatestSnapshotBundle,
  bundleFilename,
} from "@/lib/snapshot-transfer";

export async function GET() {
  try {
    await requireAdmin();
    const bundle = await buildLatestSnapshotBundle();
    const filename = bundleFilename(new Date(bundle.exportedAt));

    return new NextResponse(JSON.stringify(bundle, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
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

    return NextResponse.json({ error: "导出失败" }, { status: 500 });
  }
}
