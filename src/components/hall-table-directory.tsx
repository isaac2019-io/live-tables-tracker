import { GAME_TYPES, DB_HALLS, getDbHall } from "@/lib/constants";

type HallTableRow = {
  tableName: string;
  gameType: string;
  hall?: string | null;
};

export function HallTableDirectory({ tables }: { tables: HallTableRow[] }) {
  if (tables.length === 0) {
    return <p className="text-sm text-slate-400">暂无桌台明细</p>;
  }

  return (
    <div className="space-y-8">
      {DB_HALLS.map((hall) => {
        const hallRows = tables.filter((row) => row.hall === hall.slug);
        if (hallRows.length === 0) return null;

        const grouped = GAME_TYPES.map((game) => ({
          game,
          rows: hallRows.filter((row) => row.gameType === game.key),
        })).filter((group) => group.rows.length > 0);

        return (
          <section key={hall.slug} className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-white">
                {getDbHall(hall.slug)?.label ?? hall.slug}
              </h3>
              <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-black text-orange-200">
                {hallRows.length} 张
              </span>
            </div>

            <div className="space-y-5 pl-0 sm:pl-2">
              {grouped.map(({ game, rows }) => (
                <div key={game.key}>
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-orange-300">
                      {game.labelZh}
                    </h4>
                    <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-black text-blue-200">
                      {rows.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rows.map((row) => (
                      <span
                        key={`${hall.slug}-${row.tableName}`}
                        className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs text-slate-200"
                      >
                        {row.tableName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
