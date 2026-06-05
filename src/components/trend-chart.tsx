import { formatUtc8 } from "@/lib/timezone";
import type { snapshots } from "@/lib/db/schema";

export function TrendChart({
  rows,
}: {
  rows: (typeof snapshots.$inferSelect)[];
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-400">暂无趋势数据</p>;
  }

  const max = Math.max(...rows.map((row) => row.totalTables), 1);

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const width = Math.max((row.totalTables / max) * 100, 2);
        return (
          <div key={row.id} className="grid grid-cols-[88px_1fr_48px] items-center gap-3">
            <span className="text-xs text-slate-400">
              {formatUtc8(row.recordedAt, "MM-dd")}
            </span>
            <div className="h-3 rounded-full bg-white/5">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-blue-500"
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="text-right text-sm font-black text-orange-300">
              {row.totalTables}
            </span>
          </div>
        );
      })}
    </div>
  );
}
