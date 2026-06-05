import { GameTypeBreakdown } from "@/components/game-type-breakdown";
import { Card } from "@/components/ui";
import {
  DB_HALLS,
  GAME_TYPES,
  type DbHallSlug,
  type GameTypeKey,
  getDbHall,
} from "@/lib/constants";

type HallTableRow = {
  tableName: string;
  gameType: string;
  hall?: string | null;
};

function summarizeHall(tables: HallTableRow[], hallSlug: DbHallSlug) {
  const rows = tables.filter((row) => row.hall === hallSlug);
  const counts = {
    baccarat: 0,
    blackjack: 0,
    roulette: 0,
    dragonTiger: 0,
    sicBo: 0,
    gameShow: 0,
    poker: 0,
    other: 0,
  } satisfies Record<GameTypeKey, number>;

  for (const row of rows) {
    const key = row.gameType as GameTypeKey;
    if (key in counts) counts[key] += 1;
  }

  return { rows, counts, total: rows.length };
}

export function HallOverview({ tables }: { tables: HallTableRow[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {DB_HALLS.map((hall) => {
        const summary = summarizeHall(tables, hall.slug);
        const hallMeta = getDbHall(hall.slug);

        return (
          <Card
            key={hall.slug}
            title={hallMeta?.label ?? hall.slug}
            className="flex flex-col gap-4"
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  桌台数
                </p>
                <p className="mt-1 text-3xl font-black text-orange-300">
                  {summary.total}
                </p>
              </div>
              <p className="text-xs text-slate-500">{hall.labelEn}</p>
            </div>

            {summary.total === 0 ? (
              <p className="text-sm text-slate-400">待录入数据</p>
            ) : (
              <div className="space-y-2">
                {GAME_TYPES.map((game) => {
                  const value = summary.counts[game.key];
                  if (value === 0) return null;
                  return (
                    <div
                      key={game.key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-400">{game.labelZh}</span>
                      <span className="font-bold text-slate-200">{value}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export function HallDetailPanels({ tables }: { tables: HallTableRow[] }) {
  return (
    <div className="space-y-6">
      {DB_HALLS.map((hall) => {
        const summary = summarizeHall(tables, hall.slug);
        if (summary.total === 0) return null;

        return (
          <Card
            key={hall.slug}
            title={`${getDbHall(hall.slug)?.label ?? hall.slug}（${summary.total} 张）`}
          >
            <GameTypeBreakdown counts={summary.counts} total={summary.total} />
          </Card>
        );
      })}
    </div>
  );
}
