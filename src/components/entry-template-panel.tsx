"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Card } from "@/components/ui";
import { DB_HALLS, GAME_TYPES } from "@/lib/constants";

export function EntryTemplatePanel() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function handleImport(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("请选择 CSV 文件");
      return;
    }

    setImporting(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/snapshots/import", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "导入失败");
      }

      setMessage(`成功导入 ${data.imported} 条快照`);
      setFile(null);
      router.push("/admin/history");
      router.refresh();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "导入失败");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="录入模板（CSV）">
        <div className="space-y-4 text-sm leading-7 text-slate-300">
          <p>
            推荐后续录入使用 CSV：每一行填写 1 张桌台，系统会自动按游戏类型汇总。
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-slate-400">
            <li>下载模板 CSV</li>
            <li>按示例填写 platform、时间、桌台名、游戏类型</li>
            <li>上传导入，或继续用下方表单手动录入汇总数字</li>
          </ol>
          <a
            href="/api/templates/entry"
            className="inline-flex rounded-full bg-orange-500 px-5 py-2.5 text-sm font-black text-black shadow-[0_0_35px_rgba(249,115,22,0.35)] transition hover:bg-orange-300"
          >
            下载 entry-template.csv
          </a>
        </div>
      </Card>

      <Card title="CSV 表头说明">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-3 py-2">字段</th>
                <th className="px-3 py-2">说明</th>
                <th className="px-3 py-2">示例</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/10">
                <td className="px-3 py-2 font-mono text-orange-200">platform</td>
                <td className="px-3 py-2 text-slate-300">平台</td>
                <td className="px-3 py-2 text-slate-400">evo / pragmatic / choice / db</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-3 py-2 font-mono text-orange-200">hall</td>
                <td className="px-3 py-2 text-slate-300">厅（仅 DB 必填）</td>
                <td className="px-3 py-2 text-slate-400">flagship / international …</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-3 py-2 font-mono text-orange-200">recorded_at_utc8</td>
                <td className="px-3 py-2 text-slate-300">录入时间 UTC+8</td>
                <td className="px-3 py-2 text-slate-400">2026-06-05T18:30</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-3 py-2 font-mono text-orange-200">table_name</td>
                <td className="px-3 py-2 text-slate-300">桌台名称</td>
                <td className="px-3 py-2 text-slate-400">Lightning Roulette 1</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-3 py-2 font-mono text-orange-200">game_type</td>
                <td className="px-3 py-2 text-slate-300">游戏类型 key</td>
                <td className="px-3 py-2 text-slate-400">roulette</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-3 py-2 font-mono text-orange-200">note</td>
                <td className="px-3 py-2 text-slate-300">备注（可选）</td>
                <td className="px-3 py-2 text-slate-400">晚间例行录入</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="DB 厅别 hall 对照表">
        <div className="grid gap-2 sm:grid-cols-2">
          {DB_HALLS.map((hall) => (
            <div
              key={hall.slug}
              className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-sm"
            >
              <span className="font-mono text-orange-200">{hall.slug}</span>
              <span className="text-slate-400">
                {" "}
                — {hall.label} ({hall.labelEn})
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="game_type 对照表">
        <div className="grid gap-2 sm:grid-cols-2">
          {GAME_TYPES.map((game) => (
            <div
              key={game.key}
              className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-sm"
            >
              <span className="font-mono text-orange-200">{game.key}</span>
              <span className="text-slate-400">
                {" "}
                — {game.labelZh} ({game.labelEn})
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="上传 CSV 导入">
        <form className="space-y-4" onSubmit={handleImport}>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
          />
          {error ? (
            <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-2xl border border-orange-300/30 bg-orange-300/10 px-4 py-3 text-sm text-orange-200">
              {message}
            </p>
          ) : null}
          <Button type="submit" disabled={importing || !file}>
            {importing ? "导入中..." : "导入 CSV"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
