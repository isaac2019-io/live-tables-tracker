import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/session";
import { buildEntryTemplateCsv } from "@/lib/entry-template";

export async function GET() {
  try {
    await requireAdmin();

    const csv = buildEntryTemplateCsv();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="entry-template.csv"',
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
    }

    return NextResponse.json({ error: "模板下载失败" }, { status: 500 });
  }
}
