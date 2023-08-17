DO $$ BEGIN
 CREATE TYPE "user_theme" AS ENUM('dark', 'light', 'system');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "preferred_theme" "user_theme" DEFAULT 'system';