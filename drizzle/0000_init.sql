CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
CREATE TABLE `snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`platform` text NOT NULL,
	`recorded_at` integer NOT NULL,
	`total_tables` integer NOT NULL,
	`baccarat` integer NOT NULL,
	`blackjack` integer NOT NULL,
	`roulette` integer NOT NULL,
	`dragon_tiger` integer NOT NULL,
	`sic_bo` integer NOT NULL,
	`game_show` integer NOT NULL,
	`poker` integer NOT NULL,
	`other` integer NOT NULL,
	`note` text,
	`created_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer,
	`payload` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `daily_aggregates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`platform` text NOT NULL,
	`snapshot_count` integer NOT NULL,
	`total_open` integer NOT NULL,
	`total_close` integer NOT NULL,
	`total_avg` integer NOT NULL,
	`total_min` integer NOT NULL,
	`total_max` integer NOT NULL,
	`baccarat_avg` integer NOT NULL,
	`baccarat_min` integer NOT NULL,
	`baccarat_max` integer NOT NULL,
	`blackjack_avg` integer NOT NULL,
	`blackjack_min` integer NOT NULL,
	`blackjack_max` integer NOT NULL,
	`roulette_avg` integer NOT NULL,
	`roulette_min` integer NOT NULL,
	`roulette_max` integer NOT NULL,
	`dragon_tiger_avg` integer NOT NULL,
	`dragon_tiger_min` integer NOT NULL,
	`dragon_tiger_max` integer NOT NULL,
	`sic_bo_avg` integer NOT NULL,
	`sic_bo_min` integer NOT NULL,
	`sic_bo_max` integer NOT NULL,
	`game_show_avg` integer NOT NULL,
	`game_show_min` integer NOT NULL,
	`game_show_max` integer NOT NULL,
	`poker_avg` integer NOT NULL,
	`poker_min` integer NOT NULL,
	`poker_max` integer NOT NULL,
	`other_avg` integer NOT NULL,
	`other_min` integer NOT NULL,
	`other_max` integer NOT NULL,
	`peak_at` integer,
	`trough_at` integer,
	`computed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_aggregates_date_platform_unique` ON `daily_aggregates` (`date`, `platform`);
