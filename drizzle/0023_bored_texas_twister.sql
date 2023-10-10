ALTER TABLE "gh_next_comments" ADD COLUMN "content_search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "gh_next_issues" ADD COLUMN "body_search_vector" "tsvector";--> statement-breakpoint

UPDATE gh_next_issues SET body_search_vector = to_tsvector('english', body);
UPDATE gh_next_comments SET content_search_vector = to_tsvector('english', content);

CREATE INDEX IF NOT EXISTS "content_search_vector_idex" ON "gh_next_comments" using gin("content_search_vector");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "body_search_vector_idex" ON "gh_next_issues" using gin("body_search_vector");