import type { DbHallSlug } from "@/lib/constants";
import type { TableEntry } from "@/lib/table-entries";
import { summarizeCounts } from "@/lib/table-entries";

import {
  DB_LOBBY_CAPTURE_INIT_SCRIPT,
  type DbLobbyCaptureState,
  type RawDbLobbyTable,
} from "@/lib/collectors/db/capture-script";
import { mapDbGameType, getDbGameTypeLabel } from "@/lib/collectors/db/game-types";
import { mapDbCasinoHall } from "@/lib/collectors/db/hall-map";
import { importPlaywright } from "@/lib/collectors/playwright-runtime";

const GAME_STATUS_MAINTAIN = 6;
const OPEN_STATUS_TEST = 6;

function formatTableName(table: RawDbLobbyTable): string {
  const label = getDbGameTypeLabel(table.gameTypeId);
  const code = table.physicsTableNo?.trim() || table.tableName?.trim();
  if (code && !code.startsWith(label)) {
    return `${label} ${code}`;
  }
  return code || label;
}

function isActiveTable(table: RawDbLobbyTable): boolean {
  if (table.openStatus === OPEN_STATUS_TEST) return true;
  if (table.tableOpen === false) return false;
  if (table.gameStatus === GAME_STATUS_MAINTAIN) return false;
  return true;
}

export function parseDbLobbyTables(
  rawTables: Record<string, RawDbLobbyTable>,
): TableEntry[] {
  const entries: TableEntry[] = [];

  for (const table of Object.values(rawTables)) {
    if (!table?.tableId || !isActiveTable(table)) continue;

    const hall = mapDbCasinoHall(table.gameCasinoId);
    if (!hall) continue;

    entries.push({
      name: formatTableName(table),
      gameType: mapDbGameType(table.gameTypeId),
      hall,
    });
  }

  const hallOrder: DbHallSlug[] = [
    "flagship",
    "international",
    "asia-pacific",
    "vietnam",
    "europe",
    "romania",
    "americas",
    "ebet",
  ];
  entries.sort((a, b) => {
    const ah = a.hall ? hallOrder.indexOf(a.hall) : 99;
    const bh = b.hall ? hallOrder.indexOf(b.hall) : 99;
    if (ah !== bh) return ah - bh;
    return a.name.localeCompare(b.name, "zh-CN");
  });

  return entries;
}

export type DbLobbyFetchResult = {
  tables: TableEntry[];
  totalTables: number;
  counts: ReturnType<typeof summarizeCounts>["counts"];
  capture: DbLobbyCaptureState;
};

export async function fetchDbLobbyTables(
  lobbyUrl: string,
  options?: { timeoutMs?: number },
): Promise<DbLobbyFetchResult> {
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
    });
    const page = await context.newPage();
    await page.addInitScript(DB_LOBBY_CAPTURE_INIT_SCRIPT);

    await page.goto(lobbyUrl, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs,
    });

    async function dismissBlockingDialogs() {
      await page.evaluate(() => {
        const labels = ["切换线路", "确定", "继续", "知道了", "返回"];
        for (const label of labels) {
          const el = [...document.querySelectorAll("button, div, span, a, p, label")].find(
            (node) => (node.textContent ?? "").trim() === label,
          );
          if (el instanceof HTMLElement) el.click();
        }
      });
      for (const label of ["切换线路", "确定", "继续", "知道了"]) {
        await page
          .getByRole("button", { name: label })
          .click({ timeout: 400 })
          .catch(() => {});
      }
    }

    const deadline = Date.now() + timeoutMs;
    let capture: DbLobbyCaptureState | null = null;

    const tableCount = (state: DbLobbyCaptureState | null) =>
      state ? Object.keys(state.tables).length : 0;

    let lineSwitchAttempts = 0;

    while (Date.now() < deadline) {
      const bodySnippet = await page.evaluate(
        () => document.body?.innerText?.slice(0, 300) ?? "",
      );
      if (
        bodySnippet.includes("线路不稳定") &&
        lineSwitchAttempts < 3
      ) {
        lineSwitchAttempts += 1;
        await dismissBlockingDialogs();
        await page.waitForTimeout(3000);
        if (lineSwitchAttempts === 2) {
          await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 }).catch(() => {});
        }
        continue;
      }

      await dismissBlockingDialogs();
      capture = await page.evaluate(() => window.__dbLobbyCapture ?? null);
      const count = tableCount(capture);

      if (capture?.sessionExpired && count === 0) {
        await page
          .getByRole("button", { name: "确定" })
          .click({ timeout: 500 })
          .catch(() => {});
        await page.waitForTimeout(500);
        capture = await page.evaluate(() => window.__dbLobbyCapture ?? null);
        if (tableCount(capture) === 0) {
          throw new Error(
            "DB 大厅链接已过期，请重新生成带 params/signature/ttl 的签名 URL，并立即执行 sync",
          );
        }
      }

      if (capture?.ready || count >= 5) {
        break;
      }
      await page.waitForTimeout(500);
    }

    if (!capture || tableCount(capture) === 0) {
      const bodyPreview = await page.evaluate(
        () => document.body?.innerText?.slice(0, 200) ?? "",
      );
      const expired = bodyPreview.includes("登录信息已过期");
      throw new Error(
        expired
          ? "DB 大厅链接已过期，请重新生成签名 URL 并在生成后几秒内执行 sync"
          : `未能从 DB 大厅采集到桌台数据。页面状态：${bodyPreview || "未知"}`,
      );
    }

    const tables = parseDbLobbyTables(capture.tables);
    if (tables.length === 0) {
      throw new Error("DB 大厅已加载，但没有匹配到七个目标厅的开放桌台");
    }

    const { counts, totalTables } = summarizeCounts(tables);
    return { tables, totalTables, counts, capture };
  } finally {
    await browser.close();
  }
}

declare global {
  interface Window {
    __dbLobbyCapture?: DbLobbyCaptureState;
  }
}
