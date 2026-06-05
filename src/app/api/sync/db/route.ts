import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { syncDbFromLobbyUrl } from "@/lib/collectors/sync-db";

export const maxDuration = 120;

const bodySchema = z.object({
  lobbyUrl: z
    .string()
    .trim()
    .url("请输入有效 URL")
    .refine(
      (url) =>
        url.includes("haojinapp.com") &&
        url.includes("params=") &&
        (url.includes("/egret/hall") || url.includes("/egret/?")),
      "请输入 DB 签名大厅链接（含 params、signature、ttl）",
    ),
});

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const json = await request.json();
    const { lobbyUrl } = bodySchema.parse(json);
    const result = await syncDbFromLobbyUrl(lobbyUrl, { userId: session.id });

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
        ? "当前环境未安装 Playwright 浏览器。请在本地运行 npm run dev，或配置带 Chromium 的采集环境。"
        : error.message;

      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ error: "DB 同步失败" }, { status: 500 });
  }
}
