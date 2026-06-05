import { redirect } from "next/navigation";

import { EntryTemplatePanel } from "@/components/entry-template-panel";
import { SnapshotEntryForm } from "@/components/snapshot-entry-form";
import { Card, PageShell } from "@/components/ui";
import { getSession } from "@/lib/auth/session";

export default async function AdminEntryPage() {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/");
  }

  return (
    <PageShell
      title="录入桌台数据"
      description="推荐使用 CSV 模板按桌台名录入；也可继续用汇总表单快速填写 8 类游戏类型。"
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <EntryTemplatePanel />
        <Card title="快速汇总录入">
          <p className="mb-4 text-sm text-slate-400">
            若你只有各游戏类型总数、没有逐桌名单，可使用此表单。
          </p>
          <SnapshotEntryForm />
        </Card>
      </div>
    </PageShell>
  );
}
