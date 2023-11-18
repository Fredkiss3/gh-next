-- Custom SQL migration file, put you code below! --
CREATE INDEX IF NOT EXISTS "comment_count_issue_id_idx" ON "comment_count_per_issue" ("issue_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reaction_count_issue_id_idx" ON "reaction_count_per_issue" ("issue_id");
