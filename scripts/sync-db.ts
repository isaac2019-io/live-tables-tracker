import { fetchDbLobbyTables } from "../src/lib/collectors/db/fetch-lobby";

async function main() {
  const url = process.env.DB_LOBBY_URL;
  if (!url) {
    console.error("请设置 DB_LOBBY_URL 环境变量");
    process.exit(1);
  }

  const result = await fetchDbLobbyTables(url);
  console.log(
    JSON.stringify(
      {
        totalTables: result.totalTables,
        counts: result.counts,
        halls: Object.fromEntries(
          [
            "flagship",
            "international",
            "asia-pacific",
            "vietnam",
            "europe",
            "romania",
            "americas",
            "ebet",
          ].map(
            (hall) => [
              hall,
              result.tables.filter((row) => row.hall === hall).length,
            ],
          ),
        ),
        sample: result.tables.slice(0, 8),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
