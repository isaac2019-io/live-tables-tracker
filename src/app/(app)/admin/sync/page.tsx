import { redirect } from "next/navigation";

import { DbUrlSyncPanel } from "@/components/db-url-sync-panel";
import { EvoLoginSyncPanel } from "@/components/evo-login-sync-panel";
import { SnapshotTransferPanel } from "@/components/snapshot-transfer-panel";
import { Card, PageShell } from "@/components/ui";
import { PLAYWRIGHT_UNSUPPORTED_MESSAGE } from "@/lib/collectors/playwright-runtime";
import { getSession } from "@/lib/auth/session";

export default async function AdminSyncPage() {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/");
  }

  const onVercel = process.env.VERCEL === "1";

  return (
    <PageShell
      title="平台数据同步"
      description="通过 DB 签名链接或 Evo 代理站账号，在本地一键采集桌台数据并写入快照。"
      eyebrow="管理员"
    >
      {onVercel ? (
        <Card className="border-amber-400/30 bg-amber-500/10">
          <p className="text-sm leading-7 text-amber-100">{PLAYWRIGHT_UNSUPPORTED_MESSAGE}</p>
        </Card>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <DbUrlSyncPanel disabled={onVercel} />
        <EvoLoginSyncPanel disabled={onVercel} />
      </div>
      <div className="mt-6">
        <SnapshotTransferPanel />
      </div>
      <Card title="使用说明" className="mt-6">
        <div className="grid gap-6 md:grid-cols-2 text-sm leading-7 text-slate-400">
          <div>
            <p className="mb-2 font-bold text-orange-200">DB</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>生成 DB 签名大厅 URL（含 params / signature / ttl）。</li>
              <li>粘贴后几秒内点击同步。</li>
            </ol>
          </div>
          <div>
            <p className="mb-2 font-bold text-orange-200">Evo</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>填写代理站登录页、账号、密码。</li>
              <li>自动登录并进入 EVO 真人大厅采集。</li>
            </ol>
          </div>
        </div>
        <p className="mt-4 text-slate-500">
          两项功能均需 Playwright，请在本地{" "}
          <code className="text-orange-200">npm run dev</code> 使用。Vercel
          线上无法运行浏览器采集，失败时仍显示手工统计表。
        </p>
      </Card>
    </PageShell>
  );
}
