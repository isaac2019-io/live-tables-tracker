import { NextResponse } from "next/server";
import { z } from "zod";

import { recomputeDailyForDate } from "@/lib/aggregates";
import { requireAdmin } from "@/lib/auth/session";
import { isValidDateString } from "@/lib/timezone";

const bodySchema = z.object({
  date: z.string(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = bodySchema.parse(await request.json());

    if (!isValidDateString(body.date)) {
      return NextResponse.json({ error: "日期格式应为 YYYY-MM-DD" }, { status: 400 });
    }

    const results = await recomputeDailyForDate(body.date);
    return NextResponse.json({ date: body.date, results });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "未登录" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "无权限" }, { status: 403 });
      }
    }

    return NextResponse.json({ error: "重算失败" }, { status: 500 });
  }
}
