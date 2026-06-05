CREATE TABLE `snapshot_tables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snapshot_id` integer NOT NULL,
	`table_name` text NOT NULL,
	`game_type` text NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `snapshot_tables_snapshot_id_idx` ON `snapshot_tables` (`snapshot_id`);
--> statement-breakpoint
CREATE INDEX `snapshot_tables_game_type_idx` ON `snapshot_tables` (`game_type`);
