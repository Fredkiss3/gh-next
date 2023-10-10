CREATE TABLE IF NOT EXISTS "gh_next_issue_user_mentions" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"issue_id" integer NOT NULL,
	"comment_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_user_mentions" ADD CONSTRAINT "gh_next_issue_user_mentions_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_user_mentions" ADD CONSTRAINT "gh_next_issue_user_mentions_comment_id_gh_next_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "gh_next_comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
