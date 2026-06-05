import { GAME_TYPES } from "@/lib/constants";
import type { GameTypeCounts } from "@/lib/constants";

export function GameTypeBreakdown({
  counts,
  total,
}: {
  counts: GameTypeCounts;
  total: number;
}) {
  const max = Math.max(...GAME_TYPES.map((g) => counts[g.key] ?? 0), 1);

  return (
    <div className="space-y-3">
      {GAME_TYPES.map((game) => {
        const value = counts[game.key] ?? 0;
        const width = Math.max((value / max) * 100, value > 0 ? 4 : 0);
        return (
          <div
            key={game.key}
            className="grid grid-cols-[120px_1fr_40px] items-center gap-3"
          >
            <span className="text-xs text-slate-400">{game.labelZh}</span>
            <div className="h-2 rounded-full bg-white/5">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-blue-500"
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="text-right text-sm font-bold text-slate-200">
              {value}
            </span>
          </div>
        );
      })}
      <p className="pt-1 text-xs text-slate-500">合计 {total} 桌</p>
    </div>
  );
}
