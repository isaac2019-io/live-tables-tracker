"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Card, Label } from "@/components/ui";
import { DB_HALLS } from "@/lib/constants";
import type { DbHallSlug, GameTypeCounts } from "@/lib/constants";

type SyncResponse = {
  ok: boolean;
  totalTables: number;
  counts: GameTypeCounts;
  halls: Partial<Record<DbHallSlug, number>>;
  snapshotId: number;
  recordedAt: string;
  error?: string;
};

export function DbUrlSyncPanel({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [lobbyUrl, setLobbyUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResponse | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/sync/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lobbyUrl }),
      });
      const data = (await response.json()) as SyncResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "同步失败");
      }

      setResult(data);
      setLobbyUrl("");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "同步失败",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title="DB 大厅链接同步">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm leading-7 text-slate-400">
          粘贴 DB 签名大厅 URL（含{" "}
          <code className="text-orange-200">params</code>、
          <code className="text-orange-200">signature</code>、
          <code className="text-orange-200">ttl</code>
          ）。链接时效很短，生成后请立即同步。采集需 Playwright，请在本地或带
          Chromium 的环境运行。
        </p>
        <div>
          <Label>DB 大厅 URL</Label>
          <textarea
            value={lobbyUrl}
            onChange={(event) => setLobbyUrl(event.target.value)}
            required
            rows={4}
            placeholder="https://pc.haojinapp.com/egret/hall?params=...&signature=...&ttl=..."
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-300"
          />
        </div>
        {error ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
        {result ? (
          <div className="space-y-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100">
            <p className="font-bold">
              同步成功：{result.totalTables} 张桌台（快照 #{result.snapshotId}）
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {DB_HALLS.map((hall) => {
                const count = result.halls[hall.slug];
                if (!count) return null;
                return (
                  <p key={hall.slug}>
                    {hall.label}：{count}
                  </p>
                );
              })}
            </div>
          </div>
        ) : null}
        <Button type="submit" disabled={submitting || !lobbyUrl.trim() || disabled}>
          {submitting ? "采集中，请稍候（约 30–90 秒）…" : "立即同步 DB 数据"}
        </Button>
      </form>
    </Card>
  );
}
