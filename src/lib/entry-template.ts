import {
  GAME_TYPE_KEYS,
  GAME_TYPES,
  type GameTypeKey,
  type PlatformSlug,
  isPlatformSlug,
} from "@/lib/constants";
import type { TableEntry } from "@/lib/table-entries";
import { summarizeCounts } from "@/lib/table-entries";

export const ENTRY_TEMPLATE_HEADERS = [
  "platform",
  "recorded_at_utc8",
  "table_name",
  "game_type",
  "note",
] as const;

export type EntryTemplateRow = {
  platform: PlatformSlug;
  recordedAtUtc8: string;
  tableName: string;
  gameType: GameTypeKey;
  note?: string;
};

const EXAMPLE_ROWS: EntryTemplateRow[] = [
  {
    platform: "evo",
    recordedAtUtc8: "2026-06-05T18:30",
    tableName: "Lightning Roulette 1",
    gameType: "roulette",
    note: "示例行，录入前请删除或覆盖",
  },
  {
    platform: "evo",
    recordedAtUtc8: "2026-06-05T18:30",
    tableName: "Speed Baccarat 1",
    gameType: "baccarat",
    note: "示例行，录入前请删除或覆盖",
  },
  {
    platform: "evo",
    recordedAtUtc8: "2026-06-05T18:30",
    tableName: "Infinite Blackjack 1",
    gameType: "blackjack",
  },
  {
    platform: "pragmatic",
    recordedAtUtc8: "2026-06-05T18:30",
    tableName: "Blackjack 74 - Ruby",
    gameType: "blackjack",
    note: "示例行，录入前请删除或覆盖",
  },
  {
    platform: "pragmatic",
    recordedAtUtc8: "2026-06-05T18:30",
    tableName: "Speed Baccarat 2 - Korean",
    gameType: "baccarat",
  },
  {
    platform: "pragmatic",
    recordedAtUtc8: "2026-06-05T18:30",
    tableName: "Mega Wheel",
    gameType: "gameShow",
  },
  {
    platform: "choice",
    recordedAtUtc8: "2026-06-05T18:30",
    tableName: "KISS Roulette AI Alisa",
    gameType: "roulette",
    note: "示例行，录入前请删除或覆盖",
  },
  {
    platform: "choice",
    recordedAtUtc8: "2026-06-05T18:30",
    tableName: "Evra Sic Bo",
    gameType: "sicBo",
  },
];

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowToCsv(row: EntryTemplateRow) {
  return [
    row.platform,
    row.recordedAtUtc8,
    row.tableName,
    row.gameType,
    row.note ?? "",
  ]
    .map(escapeCsvCell)
    .join(",");
}

export function buildEntryTemplateCsv() {
  const lines = [ENTRY_TEMPLATE_HEADERS.join(","), ...EXAMPLE_ROWS.map(rowToCsv)];
  return `${lines.join("\n")}\n`;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function isGameTypeKey(value: string): value is GameTypeKey {
  return (GAME_TYPE_KEYS as string[]).includes(value);
}

export function parseEntryTemplateCsv(content: string) {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (lines.length === 0) {
    throw new Error("CSV 内容为空");
  }

  const header = parseCsvLine(lines[0]).map((cell) => cell.toLowerCase());
  const expected = [...ENTRY_TEMPLATE_HEADERS];
  const headerValid = expected.every((key, index) => header[index] === key);

  if (!headerValid) {
    throw new Error(
      `表头必须为：${expected.join(",")}`,
    );
  }

  const rows: EntryTemplateRow[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const cells = parseCsvLine(lines[index]);
    if (cells.length < 4) {
      throw new Error(`第 ${index + 1} 行列数不足`);
    }

    const [platformRaw, recordedAtUtc8, tableName, gameTypeRaw, note] = cells;
    const platform = platformRaw.toLowerCase();

    if (!isPlatformSlug(platform)) {
      throw new Error(`第 ${index + 1} 行平台无效：${platformRaw}`);
    }

    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(recordedAtUtc8)) {
      throw new Error(
        `第 ${index + 1} 行时间格式应为 YYYY-MM-DDTHH:mm（UTC+8）`,
      );
    }

    if (!tableName) {
      throw new Error(`第 ${index + 1} 行桌台名称不能为空`);
    }

    if (!isGameTypeKey(gameTypeRaw)) {
      throw new Error(
        `第 ${index + 1} 行游戏类型无效：${gameTypeRaw}。可选：${GAME_TYPE_KEYS.join(", ")}`,
      );
    }

    rows.push({
      platform,
      recordedAtUtc8,
      tableName,
      gameType: gameTypeRaw,
      note: note || undefined,
    });
  }

  if (rows.length === 0) {
    throw new Error("没有可导入的数据行");
  }

  return rows;
}

export function groupEntryRows(rows: EntryTemplateRow[]) {
  const groups = new Map<
    string,
    { platform: PlatformSlug; recordedAtUtc8: string; note?: string; tables: TableEntry[] }
  >();

  for (const row of rows) {
    const key = `${row.platform}::${row.recordedAtUtc8}`;
    const existing = groups.get(key) ?? {
      platform: row.platform,
      recordedAtUtc8: row.recordedAtUtc8,
      note: row.note,
      tables: [],
    };

    if (!existing.note && row.note) {
      existing.note = row.note;
    }

    existing.tables.push({
      name: row.tableName,
      gameType: row.gameType,
    });

    groups.set(key, existing);
  }

  return [...groups.values()].map((group) => {
    const { counts, totalTables } = summarizeCounts(group.tables);
    return {
      ...group,
      counts,
      totalTables,
    };
  });
}

export function getEntryTemplateGuide() {
  return {
    headers: ENTRY_TEMPLATE_HEADERS,
    gameTypes: GAME_TYPES.map((item) => ({
      key: item.key,
      labelZh: item.labelZh,
      labelEn: item.labelEn,
    })),
    rules: [
      "每一行代表 1 张桌台，同一平台 + 同一时间可写多行",
      "platform 仅支持 evo、pragmatic、choice",
      "recorded_at_utc8 使用 UTC+8，格式 YYYY-MM-DDTHH:mm",
      "game_type 必须使用英文 key（见下表）",
      "导入后系统自动汇总 8 类游戏类型和桌台总数",
    ],
  };
}
