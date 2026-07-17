CREATE TABLE `subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lemon_squeezy_id` text NOT NULL,
	`order_id` integer,
	`customer_id` integer,
	`variant_id` integer NOT NULL,
	`product_id` integer,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`status` text NOT NULL,
	`status_formatted` text NOT NULL,
	`renews_at` text,
	`ends_at` text,
	`trial_ends_at` text,
	`is_paused` integer DEFAULT false NOT NULL,
	`customer_portal_url` text,
	`update_payment_method_url` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscription_lemon_squeezy_id_unique` ON `subscription` (`lemon_squeezy_id`);--> statement-breakpoint
CREATE TABLE `webhook_event` (
	`id` text PRIMARY KEY NOT NULL,
	`event_name` text NOT NULL,
	`processed` integer DEFAULT false NOT NULL,
	`body` text NOT NULL,
	`processing_error` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
