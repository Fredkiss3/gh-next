ALTER TABLE "gh_next_issue_events" DROP CONSTRAINT "gh_next_issue_events_assignee_id_gh_next_users_id_fk";
--> statement-breakpoint
ALTER TABLE "gh_next_issue_events" DROP COLUMN IF EXISTS "assignee_id";