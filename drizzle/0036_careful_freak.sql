CREATE INDEX IF NOT EXISTS "author_fk_idx" ON "gh_next_reactions" ("author_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "issue_fk_idx" ON "gh_next_reactions" ("issue_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_fk_idx" ON "gh_next_reactions" ("comment_id");