import { NextResponse } from "next/server";

import { recomputePreviousUtc8Day } from "@/lib/aggregates";

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await recomputePreviousUtc8Day();
    return NextResponse.json({
      ok: true,
      timezone: "UTC+8",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Cron failed",
      },
      { status: 500 },
    );
  }
}
