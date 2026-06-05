import { GAME_TYPES } from "@/lib/constants";

type TableRow = {
  tableName: string;
  gameType: string;
};

export function TableDirectory({ tables }: { tables: TableRow[] }) {
  if (tables.length === 0) {
    return <p className="text-sm text-slate-400">暂无桌台明细</p>;
  }

  const grouped = GAME_TYPES.map((game) => ({
    game,
    rows: tables.filter((t) => t.gameType === game.key),
  })).filter((group) => group.rows.length > 0);

  return (
    <div className="space-y-6">
      {grouped.map(({ game, rows }) => (
        <div key={game.key}>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-orange-300">
              {game.labelZh}
            </h3>
            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-black text-blue-200">
              {rows.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {rows.map((row) => (
              <span
                key={row.tableName}
                className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs text-slate-200"
              >
                {row.tableName}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
