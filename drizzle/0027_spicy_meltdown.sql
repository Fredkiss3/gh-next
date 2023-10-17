ALTER TABLE "gh_next_issues" ADD COLUMN "body_search_vector" tsvector generated always as (to_tsvector('english',body)) stored;--> statement-breakpoint
ALTER TABLE "gh_next_issues" ADD COLUMN "title_search_vector" tsvector generated always as (
      setweight(to_tsvector('simple',title), 'A')  || ' ' || 
      setweight(to_tsvector('english',title), 'B')) stored;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "body_search_vector_idx" ON "gh_next_issues" using gin("body_search_vector");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "title_search_vector_idx" ON "gh_next_issues" using gin("title_search_vector");