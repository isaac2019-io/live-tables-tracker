import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { createUser, createUserSchema, listUsers } from "@/lib/users";

export async function GET() {
  try {
    await requireAdmin();
    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "未登录" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "无权限" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "读取失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = createUserSchema.parse(await request.json());
    const user = await createUser(body);

    await writeAuditLog({
      userId: session.id,
      action: "create",
      entityType: "user",
      entityId: user.id,
      payload: { email: user.email, role: user.role },
    });

    return NextResponse.json({ user });
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
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
