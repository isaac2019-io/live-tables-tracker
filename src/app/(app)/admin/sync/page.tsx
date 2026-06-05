import { redirect } from "next/navigation";

import { DbUrlSyncPanel } from "@/components/db-url-sync-panel";
import { Card, PageShell } from "@/components/ui";
import { getSession } from "@/lib/auth/session";

export default async function AdminSyncPage() {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/");
  }

  return (
    <PageShell
      title="DB 链接同步"
      description="从 DB 签名大厅链接实时采集桌台数据并写入快照。采集失败时网站仍显示手工统计表数据。"
      eyebrow="管理员"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <DbUrlSyncPanel />
        <Card title="使用说明">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-7 text-slate-400">
            <li>在 DB 后台生成大厅签名链接（含 params / signature / ttl）。</li>
            <li>复制完整 URL，粘贴到左侧输入框。</li>
            <li>点击「立即同步」——请在生成链接后几秒内操作。</li>
            <li>成功后会更新 DB 平台最新快照与各厅桌台明细。</li>
          </ol>
          <p className="mt-4 text-sm text-slate-500">
            Vercel 线上环境无法运行 Playwright，此功能请在本地{" "}
            <code className="text-orange-200">npm run dev</code> 后使用。线上
            仍展示手工统计表（243 桌）。
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
