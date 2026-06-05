import { NextResponse } from "next/server";

import { syncPublicPlatformData } from "@/lib/collectors/sync-public";
import { requireAdmin } from "@/lib/auth/session";

function isCronAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

async function handleSync(request: Request) {
  const fromCron = isCronAuthorized(request);
  if (!fromCron) {
    await requireAdmin();
  }

  const results = await syncPublicPlatformData();
  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    platforms: results.map((item) => ({
      platform: item.data.platform,
      totalTables: item.data.totalTables,
      counts: item.data.counts,
      sources: item.data.sources,
    })),
  });
}

export async function GET(request: Request) {
  try {
    return await handleSync(request);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "未登录" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "无权限" }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "同步失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    return await handleSync(request);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "未登录" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "无权限" }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "同步失败" }, { status: 500 });
  }
}
