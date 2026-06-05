import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["viewer", "admin"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const snapshots = sqliteTable("snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platform: text("platform", {
    enum: ["evo", "pragmatic", "choice", "db"],
  }).notNull(),
  recordedAt: integer("recorded_at", { mode: "timestamp_ms" }).notNull(),
  totalTables: integer("total_tables").notNull(),
  baccarat: integer("baccarat").notNull(),
  blackjack: integer("blackjack").notNull(),
  roulette: integer("roulette").notNull(),
  dragonTiger: integer("dragon_tiger").notNull(),
  sicBo: integer("sic_bo").notNull(),
  gameShow: integer("game_show").notNull(),
  poker: integer("poker").notNull(),
  other: integer("other").notNull(),
  note: text("note"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  payload: text("payload"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const snapshotTables = sqliteTable("snapshot_tables", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  snapshotId: integer("snapshot_id")
    .notNull()
    .references(() => snapshots.id, { onDelete: "cascade" }),
  tableName: text("table_name").notNull(),
  gameType: text("game_type").notNull(),
  /** DB 平台厅别：flagship / international / asia-pacific / vietnam / europe */
  hall: text("hall"),
});

export const dailyAggregates = sqliteTable("daily_aggregates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  platform: text("platform", {
    enum: ["evo", "pragmatic", "choice", "db"],
  }).notNull(),
  snapshotCount: integer("snapshot_count").notNull(),
  totalOpen: integer("total_open").notNull(),
  totalClose: integer("total_close").notNull(),
  totalAvg: integer("total_avg").notNull(),
  totalMin: integer("total_min").notNull(),
  totalMax: integer("total_max").notNull(),
  baccaratAvg: integer("baccarat_avg").notNull(),
  baccaratMin: integer("baccarat_min").notNull(),
  baccaratMax: integer("baccarat_max").notNull(),
  blackjackAvg: integer("blackjack_avg").notNull(),
  blackjackMin: integer("blackjack_min").notNull(),
  blackjackMax: integer("blackjack_max").notNull(),
  rouletteAvg: integer("roulette_avg").notNull(),
  rouletteMin: integer("roulette_min").notNull(),
  rouletteMax: integer("roulette_max").notNull(),
  dragonTigerAvg: integer("dragon_tiger_avg").notNull(),
  dragonTigerMin: integer("dragon_tiger_min").notNull(),
  dragonTigerMax: integer("dragon_tiger_max").notNull(),
  sicBoAvg: integer("sic_bo_avg").notNull(),
  sicBoMin: integer("sic_bo_min").notNull(),
  sicBoMax: integer("sic_bo_max").notNull(),
  gameShowAvg: integer("game_show_avg").notNull(),
  gameShowMin: integer("game_show_min").notNull(),
  gameShowMax: integer("game_show_max").notNull(),
  pokerAvg: integer("poker_avg").notNull(),
  pokerMin: integer("poker_min").notNull(),
  pokerMax: integer("poker_max").notNull(),
  otherAvg: integer("other_avg").notNull(),
  otherMin: integer("other_min").notNull(),
  otherMax: integer("other_max").notNull(),
  peakAt: integer("peak_at", { mode: "timestamp_ms" }),
  troughAt: integer("trough_at", { mode: "timestamp_ms" }),
  computedAt: integer("computed_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
