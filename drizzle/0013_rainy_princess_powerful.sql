ALTER TYPE "event_type" ADD VALUE 'ADD_COMMENT';--> statement-breakpoint
ALTER TABLE "gh_next_issue_events" ADD COLUMN "comment_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_events" ADD CONSTRAINT "gh_next_issue_events_comment_id_gh_next_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "gh_next_comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
