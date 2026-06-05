"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui";

export function HistoryActions({ snapshotId }: { snapshotId: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("确认删除这条录入记录？")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/snapshots/${snapshotId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "删除失败");
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "删除失败");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/history/${snapshotId}/edit`}
        className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:border-orange-300/60 hover:bg-white/10"
      >
        编辑
      </Link>
      <Button
        type="button"
        variant="danger"
        className="px-3 py-2 text-xs"
        disabled={deleting}
        onClick={handleDelete}
      >
        {deleting ? "删除中..." : "删除"}
      </Button>
    </div>
  );
}
