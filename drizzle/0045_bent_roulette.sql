DROP INDEX IF EXISTS "title_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iss_title_idx" ON "gh_next_issues" ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iss_created_idx" ON "gh_next_issues" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iss_updated_idx" ON "gh_next_issues" ("updated_at");