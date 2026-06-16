import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import {
  formatPlaywrightError,
  isPlaywrightUnsupported,
  PLAYWRIGHT_UNSUPPORTED_MESSAGE,
} from "@/lib/collectors/playwright-runtime";

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
    if (isPlaywrightUnsupported()) {
      return NextResponse.json(
        { error: PLAYWRIGHT_UNSUPPORTED_MESSAGE },
        { status: 503 },
      );
    }

    const session = await requireAdmin();
    const json = await request.json();
    const { lobbyUrl } = bodySchema.parse(json);
    const { syncDbFromLobbyUrl } = await import("@/lib/collectors/sync-db");
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

      return NextResponse.json(
        { error: formatPlaywrightError(error) },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "DB 同步失败" }, { status: 500 });
  }
}
