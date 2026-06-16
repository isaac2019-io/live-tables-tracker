import { syncEvoFromCredentials } from "../src/lib/collectors/sync-evo";

async function main() {
  const loginUrl = process.env.EVO_LOGIN_URL ?? "https://www.bpvout.com/casino";
  const username = process.env.EVO_USERNAME;
  const password = process.env.EVO_PASSWORD;

  if (!username || !password) {
    console.error("请设置 EVO_USERNAME 和 EVO_PASSWORD 环境变量");
    process.exit(1);
  }

  const result = await syncEvoFromCredentials({ loginUrl, username, password });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
