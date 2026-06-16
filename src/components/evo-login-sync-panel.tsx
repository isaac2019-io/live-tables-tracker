"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Card, Input, Label } from "@/components/ui";
import { GAME_TYPES, type GameTypeCounts } from "@/lib/constants";

type SyncResponse = {
  ok: boolean;
  totalTables: number;
  counts: GameTypeCounts;
  snapshotId: number;
  recordedAt: string;
  sample?: { name: string; gameType: string }[];
  error?: string;
};

export function EvoLoginSyncPanel({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [loginUrl, setLoginUrl] = useState("https://www.bpvout.com/casino");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResponse | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/sync/evo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginUrl, username, password }),
      });
      const data = (await response.json()) as SyncResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "同步失败");
      }

      setResult(data);
      setPassword("");
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
    <Card title="Evo 账号同步">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm leading-7 text-slate-400">
          填写代理站登录信息，系统将自动登录 → 进入 EVO 真人 → 采集 Evolution
          大厅全部桌台。需 Playwright，请在本地运行。
        </p>
        <div>
          <Label>登录页 URL</Label>
          <Input
            type="url"
            value={loginUrl}
            onChange={(event) => setLoginUrl(event.target.value)}
            required
          />
        </div>
        <div>
          <Label>账号</Label>
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <Label>密码</Label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
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
            <div className="grid gap-1 sm:grid-cols-2">
              {GAME_TYPES.map((type) => (
                <p key={type.key}>
                  {type.labelZh}：{result.counts[type.key]}
                </p>
              ))}
            </div>
            {result.sample?.length ? (
              <p className="text-emerald-200/80">
                示例：{result.sample.map((row) => row.name).join("、")}
              </p>
            ) : null}
          </div>
        ) : null}
        <Button type="submit" disabled={submitting || !username || !password || disabled}>
          {submitting ? "登录采集中，请稍候（约 30–90 秒）…" : "立即同步 Evo 数据"}
        </Button>
      </form>
    </Card>
  );
}
