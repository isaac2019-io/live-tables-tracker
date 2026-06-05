import {
  DB_HALL_SLUGS,
  GAME_TYPE_KEYS,
  GAME_TYPES,
  type DbHallSlug,
  type GameTypeKey,
  type PlatformSlug,
  isDbHallSlug,
  isPlatformSlug,
  platformHasHalls,
} from "@/lib/constants";
import type { TableEntry } from "@/lib/table-entries";
import { summarizeCounts } from "@/lib/table-entries";

export const ENTRY_TEMPLATE_HEADERS = [
  "platform",
  "hall",
  "recorded_at_utc8",
  "table_name",
  "game_type",
  "note",
] as const;

export type EntryTemplateRow = {
  platform: PlatformSlug;
  hall?: DbHallSlug;
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
    platform: "pragmatic",
    recordedAtUtc8: "2026-06-05T18:30",
    tableName: "Blackjack 74 - Ruby",
    gameType: "blackjack",
  },
  {
    platform: "choice",
    recordedAtUtc8: "2026-06-05T18:30",
    tableName: "经典百家乐 N06",
    gameType: "baccarat",
  },
  {
    platform: "db",
    hall: "flagship",
    recordedAtUtc8: "2026-06-05T18:30",
    tableName: "示例桌台 A01",
    gameType: "baccarat",
    note: "DB 平台需填写 hall",
  },
  {
    platform: "db",
    hall: "international",
    recordedAtUtc8: "2026-06-05T18:30",
    tableName: "示例桌台 B01",
    gameType: "roulette",
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
    row.hall ?? "",
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

function isLegacyHeader(header: string[]) {
  return (
    header[0] === "platform" &&
    header[1] === "recorded_at_utc8" &&
    header[2] === "table_name"
  );
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
  const legacy = isLegacyHeader(header);

  if (!legacy) {
    const expected = [...ENTRY_TEMPLATE_HEADERS];
    const headerValid = expected.every((key, index) => header[index] === key);
    if (!headerValid) {
      throw new Error(`表头必须为：${expected.join(",")}`);
    }
  }

  const rows: EntryTemplateRow[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const cells = parseCsvLine(lines[index]);

    let platformRaw: string;
    let hallRaw: string | undefined;
    let recordedAtUtc8: string;
    let tableName: string;
    let gameTypeRaw: string;
    let note: string | undefined;

    if (legacy) {
      [platformRaw, recordedAtUtc8, tableName, gameTypeRaw, note] = cells;
    } else {
      [platformRaw, hallRaw, recordedAtUtc8, tableName, gameTypeRaw, note] =
        cells;
    }

    const platform = platformRaw.toLowerCase();

    if (!isPlatformSlug(platform)) {
      throw new Error(`第 ${index + 1} 行平台无效：${platformRaw}`);
    }

    const hall = hallRaw?.trim().toLowerCase() || undefined;

    if (platformHasHalls(platform)) {
      if (!hall) {
        throw new Error(`第 ${index + 1} 行 DB 平台必须填写 hall`);
      }
      if (!isDbHallSlug(hall)) {
        throw new Error(
          `第 ${index + 1} 行 hall 无效：${hallRaw}。可选：${DB_HALL_SLUGS.join(", ")}`,
        );
      }
    } else if (hall) {
      throw new Error(`第 ${index + 1} 行仅 DB 平台需要填写 hall`);
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
      hall: hall as DbHallSlug | undefined,
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
    {
      platform: PlatformSlug;
      recordedAtUtc8: string;
      note?: string;
      tables: TableEntry[];
    }
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
      hall: row.hall,
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
    halls: DB_HALL_SLUGS,
    gameTypes: GAME_TYPES.map((item) => ({
      key: item.key,
      labelZh: item.labelZh,
      labelEn: item.labelEn,
    })),
    rules: [
      "每一行代表 1 张桌台，同一平台 + 同一时间可写多行",
      "platform 支持 db、evo、pragmatic、choice",
      "DB 平台必须填写 hall（旗舰厅 flagship、国际厅 international、亚太厅 asia-pacific、越南厅 vietnam、欧洲厅 europe、美洲厅 americas、电投厅 ebet）",
      "其他平台 hall 留空",
      "recorded_at_utc8 使用 UTC+8，格式 YYYY-MM-DDTHH:mm",
      "game_type 必须使用英文 key（见下表）",
      "导入后系统自动汇总 8 类游戏类型和桌台总数",
    ],
  };
}
