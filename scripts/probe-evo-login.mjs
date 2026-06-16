import { chromium } from "playwright";

const username = process.env.EVO_USERNAME ?? "";
const password = process.env.EVO_PASSWORD ?? "";

async function dismissDialogs(page) {
  for (let i = 0; i < 5; i++) {
    const closed = await page.evaluate(() => {
      const close = document.querySelector(".bee-dialog [class*='close']");
      if (close instanceof HTMLElement) {
        close.click();
        return true;
      }
      return false;
    });
    if (!closed) break;
    await page.waitForTimeout(800);
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ locale: "zh-CN" });

let configs = null;
page.on("websocket", (ws) => {
  ws.on("framereceived", (frame) => {
    const text = typeof frame.payload === "string" ? frame.payload : "";
    if (text.includes("lobby.configs")) {
      try {
        const msg = JSON.parse(text);
        configs = msg.args?.configs ?? msg.args;
      } catch {}
    }
  });
});

await page.goto("https://www.bpvout.com/casino", { waitUntil: "networkidle", timeout: 90000 });
await page.getByText("登录", { exact: true }).first().click();
await page.waitForTimeout(1500);
await page.getByPlaceholder("输入用户名").fill(username);
await page.getByPlaceholder("输入登录密码").fill(password);
await page.locator(".bee-dialog .bee-button--primary").click();
await page.waitForTimeout(5000);
await dismissDialogs(page);
await page.locator(".home-venue-tabs__item").filter({ hasText: "真人" }).click({ force: true });
await page.waitForTimeout(2000);
await page.evaluate(() => {
  const headers = [...document.querySelectorAll("h3,h4,span,div")].filter(
    (el) => (el.textContent ?? "").trim() === "EVO 真人",
  );
  for (const h of headers) {
    let p = h.parentElement;
    for (let i = 0; i < 8 && p; i++) {
      const enter = [...p.querySelectorAll("*")].find(
        (el) => (el.textContent ?? "").trim() === "进入游戏",
      );
      if (enter instanceof HTMLElement) {
        enter.click();
        return;
      }
      p = p.parentElement;
    }
  }
});

for (let i = 0; i < 20 && !configs; i++) {
  await page.waitForTimeout(2000);
}

if (!configs) {
  console.log("no configs");
  await browser.close();
  process.exit(1);
}

const tables = Object.entries(configs).map(([id, cfg]) => ({
  id,
  gt: cfg.gt,
  title: cfg.title,
  published: cfg.published,
}));

const published = tables.filter((t) => t.published !== false);
const byGt = {};
for (const t of published) {
  byGt[t.gt] = (byGt[t.gt] ?? 0) + 1;
}

console.log("total published:", published.length);
console.log("by gt:", byGt);
console.log("sample:", published.slice(0, 10));

await browser.close();
