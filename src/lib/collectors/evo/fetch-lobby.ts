import type { TableEntry } from "@/lib/table-entries";
import { summarizeCounts } from "@/lib/table-entries";

import {
  mapEvoGameType,
  parseEvoLobbyConfigs,
  type EvoLobbyTable,
} from "@/lib/collectors/evo/game-types";
import { importPlaywright } from "@/lib/collectors/playwright-runtime";

export type EvoLoginCredentials = {
  loginUrl: string;
  username: string;
  password: string;
};

async function dismissDialogs(page: import("playwright").Page) {
  for (let i = 0; i < 5; i++) {
    const closed = await page.evaluate(() => {
      const close = document.querySelector(".bee-dialog [class*='close']");
      if (close instanceof HTMLElement) {
        close.click();
        return true;
      }
      const btn = [...document.querySelectorAll(".bee-dialog button, .bee-dialog .bee-button")].find(
        (el) => /知道了|关闭|确定|不再/i.test(el.textContent ?? ""),
      );
      if (btn instanceof HTMLElement) {
        btn.click();
        return true;
      }
      return false;
    });
    if (!closed) break;
    await page.waitForTimeout(800);
  }
}

async function loginBpvout(
  page: import("playwright").Page,
  credentials: EvoLoginCredentials,
) {
  await page.goto(credentials.loginUrl, {
    waitUntil: "networkidle",
    timeout: 90_000,
  });
  await page.getByText("登录", { exact: true }).first().click();
  await page.waitForTimeout(1500);
  await page.getByPlaceholder("输入用户名").fill(credentials.username);
  await page.getByPlaceholder("输入登录密码").fill(credentials.password);
  await page.locator(".bee-dialog .bee-button--primary").click();
  await page.waitForTimeout(5000);
  await dismissDialogs(page);
}

async function openEvoLobby(page: import("playwright").Page) {
  await page.locator(".home-venue-tabs__item").filter({ hasText: "真人" }).click({
    force: true,
  });
  await page.waitForTimeout(2000);

  const clicked = await page.evaluate(() => {
    const headers = [...document.querySelectorAll("h3,h4,span,div")].filter(
      (el) => (el.textContent ?? "").trim() === "EVO 真人",
    );
    for (const h of headers) {
      let parent = h.parentElement;
      for (let depth = 0; depth < 8 && parent; depth++) {
        const enter = [...parent.querySelectorAll("*")].find(
          (el) => (el.textContent ?? "").trim() === "进入游戏",
        );
        if (enter instanceof HTMLElement) {
          enter.click();
          return true;
        }
        parent = parent.parentElement;
      }
    }
    return false;
  });

  if (!clicked) {
    throw new Error("未找到 EVO 真人入口，请确认账号有 Evo 场馆权限");
  }
}

function waitForLobbyConfigs(page: import("playwright").Page, timeoutMs: number) {
  return new Promise<Record<string, { gt?: string; title?: string; published?: boolean }>>(
    (resolve, reject) => {
      const deadline = Date.now() + timeoutMs;
      let configs: Record<string, { gt?: string; title?: string; published?: boolean }> | null =
        null;

      const onWs = (ws: import("playwright").WebSocket) => {
        ws.on("framereceived", (frame) => {
          const text = typeof frame.payload === "string" ? frame.payload : "";
          if (!text.includes("lobby.configs")) return;
          try {
            const message = JSON.parse(text) as {
              args?: { configs?: Record<string, { gt?: string; title?: string; published?: boolean }> };
            };
            if (message.args?.configs) {
              configs = message.args.configs;
            }
          } catch {
            // ignore malformed frames
          }
        });
      };

      page.on("websocket", onWs);

      const poll = async () => {
        if (configs) {
          page.off("websocket", onWs);
          resolve(configs);
          return;
        }
        if (Date.now() >= deadline) {
          page.off("websocket", onWs);
          reject(new Error("等待 Evolution 大厅数据超时，请稍后重试"));
          return;
        }
        setTimeout(poll, 500);
      };

      poll();
    },
  );
}

export function evoTablesToEntries(tables: EvoLobbyTable[]): TableEntry[] {
  return tables
    .map((table) => ({
      name: table.title,
      gameType: mapEvoGameType(table),
    }))
    .sort((a, b) => a.gameType.localeCompare(b.gameType) || a.name.localeCompare(b.name, "zh-CN"));
}

export type EvoLobbyFetchResult = {
  tables: TableEntry[];
  rawTables: EvoLobbyTable[];
  totalTables: number;
  counts: ReturnType<typeof summarizeCounts>["counts"];
};

export async function fetchEvoLobbyTables(
  credentials: EvoLoginCredentials,
  options?: { timeoutMs?: number },
): Promise<EvoLobbyFetchResult> {
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const { chromium } = await importPlaywright();

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      viewport: { width: 1440, height: 900 },
      locale: "zh-CN",
    });
    const page = await context.newPage();

    const configsPromise = waitForLobbyConfigs(page, timeoutMs);
    await loginBpvout(page, credentials);
    await openEvoLobby(page);

    const configs = await configsPromise;
    const rawTables = parseEvoLobbyConfigs(configs);
    if (rawTables.length === 0) {
      throw new Error("Evolution 大厅未返回开放桌台");
    }

    const tables = evoTablesToEntries(rawTables);
    const { counts, totalTables } = summarizeCounts(tables);
    return { tables, rawTables, totalTables, counts };
  } finally {
    await browser.close();
  }
}
