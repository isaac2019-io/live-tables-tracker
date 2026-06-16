import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { syncEvoFromCredentials } from "@/lib/collectors/sync-evo";

export const maxDuration = 120;

const bodySchema = z.object({
  loginUrl: z.string().trim().url("请输入有效登录 URL").default("https://www.bpvout.com/casino"),
  username: z.string().trim().min(1, "请输入账号"),
  password: z.string().min(1, "请输入密码"),
});

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const json = await request.json();
    const credentials = bodySchema.parse(json);
    const result = await syncEvoFromCredentials(credentials, { userId: session.id });

    return NextResponse.json({
      ok: true,
      syncedAt: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "参数无效" },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "未登录" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "无权限" }, { status: 403 });
      }

      const message = error.message.includes("Executable doesn't exist")
        ? "当前环境未安装 Playwright 浏览器。请在本地运行 npm run dev，或执行 npx playwright install chromium。"
        : error.message;

      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ error: "Evo 同步失败" }, { status: 500 });
  }
}
