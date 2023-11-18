DROP INDEX IF EXISTS "author_fk_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "issue_fk_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "comment_fk_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rakt_author_fk_idx" ON "gh_next_reactions" ("author_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rakt_issue_fk_idx" ON "gh_next_reactions" ("issue_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rakt_comment_fk_idx" ON "gh_next_reactions" ("comment_id");