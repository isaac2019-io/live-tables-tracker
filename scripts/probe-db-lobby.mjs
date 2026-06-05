import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const url = process.argv[2];
const root = dirname(fileURLToPath(import.meta.url));
const initScript = readFileSync(
  join(root, "../src/lib/collectors/db/capture-script.ts"),
  "utf8",
).match(/DB_LOBBY_CAPTURE_INIT_SCRIPT = String\.raw`([\s\S]*?)`/)?.[1];

const browser = await chromium.launch({
  headless: true,
  args: ["--disable-blink-features=AutomationControlled"],
});
const page = await browser.newPage({
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  viewport: { width: 1440, height: 900 },
});
if (initScript) await page.addInitScript(initScript);
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });

for (let i = 1; i <= 20; i++) {
  await page.waitForTimeout(3000);
  const snap = await page.evaluate(() => ({
    text: document.body?.innerText?.slice(0, 400) ?? "",
    capture: window.__dbLobbyCapture ?? null,
    tableCount: window.__dbLobbyCapture
      ? Object.keys(window.__dbLobbyCapture.tables).length
      : 0,
  }));
  console.log(`poll ${i}:`, JSON.stringify(snap));
  if (snap.tableCount >= 30) break;
}

await browser.close();
