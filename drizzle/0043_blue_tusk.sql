DROP INDEX IF EXISTS "rakt_type_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rakt_type_idx" ON "gh_next_reactions" ("type");