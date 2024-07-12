ALTER TABLE `user` ADD `email` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `password_hash`;