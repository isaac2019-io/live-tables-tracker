"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Input, Label } from "@/components/ui";
import {
  GAME_TYPES,
  PLATFORMS,
  emptyGameTypeCounts,
  sumGameTypeCounts,
  type GameTypeCounts,
  type PlatformSlug,
} from "@/lib/constants";

type SnapshotEntryFormProps = {
  mode?: "create" | "edit";
  initial?: {
    id: number;
    platform: PlatformSlug;
    recordedAt: string;
    counts: GameTypeCounts;
    note?: string | null;
  };
};

export function SnapshotEntryForm({
  mode = "create",
  initial,
}: SnapshotEntryFormProps) {
  const router = useRouter();
  const [platform, setPlatform] = useState<PlatformSlug>(
    initial?.platform ?? "db",
  );
  const [recordedAt, setRecordedAt] = useState(
    initial?.recordedAt ?? formatNowUtc8(),
  );
  const [counts, setCounts] = useState<GameTypeCounts>(
    initial?.counts ?? emptyGameTypeCounts(),
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(() => sumGameTypeCounts(counts), [counts]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const url =
        mode === "edit" && initial
          ? `/api/snapshots/${initial.id}`
          : "/api/snapshots";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          recordedAt,
          note: note.trim() || undefined,
          counts,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "提交失败");
      }

      router.push("/admin/history");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "提交失败",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>平台</Label>
            <select
              value={platform}
              onChange={(event) =>
                setPlatform(event.target.value as PlatformSlug)
              }
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-300"
            >
              {PLATFORMS.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>录入时间 (UTC+8)</Label>
            <Input
              type="datetime-local"
              value={recordedAt}
              onChange={(event) => setRecordedAt(event.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <Label>游戏类型桌台数（全部必填）</Label>
            <p className="text-sm font-black text-orange-300">
              合计：{total}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {GAME_TYPES.map((game) => (
              <div key={game.key}>
                <Label>
                  {game.labelZh} ({game.labelEn})
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={counts[game.key]}
                  onChange={(event) =>
                    setCounts((current) => ({
                      ...current,
                      [game.key]: Number(event.target.value),
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>备注（可选）</Label>
          <Input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="例如：晚间维护、上新游戏"
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "提交中..." : mode === "edit" ? "保存修改" : "提交录入"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/history")}
          >
            取消
          </Button>
        </div>
      </form>
  );
}

function formatNowUtc8() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(now).replace(" ", "T");
}
