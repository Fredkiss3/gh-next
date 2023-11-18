CREATE INDEX IF NOT EXISTS "author_fk_idx" ON "gh_next_comments" ("author_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "issue_fk_idx" ON "gh_next_comments" ("issue_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "repository_fk_idx" ON "gh_next_issues" ("repository_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "author_fk_idx" ON "gh_next_issues" ("author_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "creator_fk_idx" ON "gh_next_repositories" ("creator_id");