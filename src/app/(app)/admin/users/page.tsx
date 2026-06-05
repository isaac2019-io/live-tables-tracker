import { redirect } from "next/navigation";

import { CreateUserForm } from "@/components/create-user-form";
import { DeleteUserButton } from "@/components/delete-user-button";
import { Card, EmptyState, PageShell } from "@/components/ui";
import { getSession } from "@/lib/auth/session";
import { listUsers } from "@/lib/users";
import { formatUtc8 } from "@/lib/timezone";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/");
  }

  const users = await listUsers();

  return (
    <PageShell
      title="用户管理"
      description="创建 viewer 只读账号或 admin 管理员。不支持公开注册。"
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <CreateUserForm />

        <Card title="已有账号">
          {users.length === 0 ? (
            <EmptyState message="暂无用户。" />
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-4 transition hover:border-orange-300/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">{user.email}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {user.role} · 创建于 {formatUtc8(user.createdAt, "yyyy-MM-dd")}
                    </p>
                  </div>
                  {user.id === session.id ? (
                    <span className="text-xs text-slate-500">当前账号</span>
                  ) : (
                    <DeleteUserButton userId={user.id} email={user.email} />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
