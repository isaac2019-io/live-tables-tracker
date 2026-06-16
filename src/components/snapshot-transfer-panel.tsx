"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Card, Label } from "@/components/ui";
import { PLATFORMS } from "@/lib/constants";

type ImportResponse = {
  ok: boolean;
  imported: number;
  platforms: { platform: string; snapshotId: number; totalTables: number }[];
  error?: string;
};

export function SnapshotTransferPanel() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/snapshots/export");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "导出失败");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "live-tables-snapshots.json";

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);

      setMessage(`已导出各平台最新快照（${filename}）`);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "导出失败");
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("请选择 JSON 快照文件");
      return;
    }

    setImporting(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/snapshots/import-bundle", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as ImportResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "导入失败");
      }

      const summary = data.platforms
        .map((row) => `${row.platform} ${row.totalTables}桌`)
        .join("、");
      setMessage(`成功导入 ${data.imported} 个平台快照：${summary}`);
      setFile(null);
      router.refresh();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "导入失败");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Card title="发布到线上（快照包）">
      <div className="space-y-5">
        <p className="text-sm leading-7 text-slate-400">
          本地采集完成后，导出各平台<strong className="text-slate-200">最新快照</strong>
          为 JSON，再登录线上网站导入。包含桌台明细与各厅数据。
        </p>

        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-400">
          <li>本地 <code className="text-orange-200">npm run dev</code> 完成 DB / Evo 同步</li>
          <li>点击下方「导出最新快照」下载 JSON 文件</li>
          <li>打开线上网站，管理员登录后在此上传同一文件</li>
        </ol>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {PLATFORMS.map((platform) => (
            <span
              key={platform.slug}
              className="rounded-full border border-white/10 px-3 py-1"
            >
              {platform.label}
            </span>
          ))}
        </div>

        <Button type="button" onClick={handleExport} disabled={exporting}>
          {exporting ? "导出中…" : "导出最新快照（JSON）"}
        </Button>

        <form className="space-y-4 border-t border-white/10 pt-5" onSubmit={handleImport}>
          <div>
            <Label>导入快照包（线上使用）</Label>
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-black"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={importing || !file}>
            {importing ? "导入中…" : "导入快照到当前环境"}
          </Button>
        </form>

        {error ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {message}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
