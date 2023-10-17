DROP INDEX IF EXISTS "content_search_vector_idex";--> statement-breakpoint
DROP INDEX IF EXISTS "body_search_vector_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "title_search_vector_idx";--> statement-breakpoint
ALTER TABLE "gh_next_comments" DROP COLUMN IF EXISTS "content_search_vector";--> statement-breakpoint
ALTER TABLE "gh_next_issues" DROP COLUMN IF EXISTS "body_search_vector";--> statement-breakpoint
ALTER TABLE "gh_next_issues" DROP COLUMN IF EXISTS "title_search_vector";