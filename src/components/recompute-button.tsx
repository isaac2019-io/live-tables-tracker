"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui";

export function RecomputeButton({ date }: { date: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/daily/recompute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "重算失败");
      }
      setMessage("已重算");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "重算失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="secondary" onClick={handleClick} disabled={loading}>
        {loading ? "重算中..." : "重算该日"}
      </Button>
      {message ? <span className="text-xs text-slate-400">{message}</span> : null}
    </div>
  );
}
