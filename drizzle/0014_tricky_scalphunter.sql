DO $$ BEGIN
 CREATE TYPE "issue_lock_reason" AS ENUM('OFF_TOPIC', 'TOO_HEATED', 'RESOLVED', 'SPAM');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE 'ISSUE_LOCK';--> statement-breakpoint
ALTER TABLE "gh_next_issue_events" ADD COLUMN "lock_reason" "issue_lock_reason";