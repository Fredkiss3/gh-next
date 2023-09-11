ALTER TABLE "gh_next_issue_revisions" DROP CONSTRAINT "gh_next_issue_revisions_revised_by_id_gh_next_users_id_fk";
--> statement-breakpoint
ALTER TABLE "gh_next_issue_revisions" ADD COLUMN "revised_by_username" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "gh_next_issue_revisions" ADD COLUMN "revised_by_avatar_url" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "gh_next_issues" ADD COLUMN "number" integer;--> statement-breakpoint
ALTER TABLE "gh_next_issue_revisions" DROP COLUMN IF EXISTS "revised_by_id";