ALTER TABLE "gh_next_issues" ADD COLUMN "lock_reason" "issue_lock_reason";--> statement-breakpoint
ALTER TABLE "gh_next_issue_events" DROP COLUMN IF EXISTS "lock_reason";