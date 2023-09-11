DO $$ BEGIN
 CREATE TYPE "comment_hide_reason" AS ENUM('ABUSE', 'OFF_TOPIC', 'OUTDATED', 'RESOLVED', 'DUPLICATE', 'SPAM');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "gh_next_comments" ADD COLUMN "hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "gh_next_comments" ADD COLUMN "hidden_reason" "comment_hide_reason";