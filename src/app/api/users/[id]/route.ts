import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { deleteUser } from "@/lib/users";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const userId = Number(id);

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "无效 ID" }, { status: 400 });
    }

    if (userId === session.id) {
      return NextResponse.json({ error: "不能删除当前登录账号" }, { status: 400 });
    }

    const deleted = await deleteUser(userId);

    await writeAuditLog({
      userId: session.id,
      action: "delete",
      entityType: "user",
      entityId: userId,
      payload: { email: deleted.email, role: deleted.role },
    });

    return NextResponse.json({ ok: true });
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
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
