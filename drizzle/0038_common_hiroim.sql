ALTER TABLE "gh_next_issues" DROP CONSTRAINT "uniq_number_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "author_fk_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "issue_fk_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "repository_fk_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "creator_fk_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "com_author_fk_idx" ON "gh_next_comments" ("author_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "com_issue_fk_idx" ON "gh_next_comments" ("issue_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iss_repo_fk_idx" ON "gh_next_issues" ("repository_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iss_author_fk_idx" ON "gh_next_issues" ("author_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ment_username_idx" ON "gh_next_issue_user_mentions" ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "repo_name_idx" ON "gh_next_repositories" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "repo_creator_fk_idx" ON "gh_next_repositories" ("creator_id");--> statement-breakpoint
ALTER TABLE "gh_next_issues" ADD CONSTRAINT "iss_uniq_number_idx" UNIQUE("repository_id","number");