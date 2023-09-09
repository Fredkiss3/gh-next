ALTER TABLE "gh_next_issues" DROP CONSTRAINT "gh_next_issues_assignee_id_gh_next_users_id_fk";
--> statement-breakpoint
ALTER TABLE "gh_next_issues" DROP COLUMN IF EXISTS "assignee_id";