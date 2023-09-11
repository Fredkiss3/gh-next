ALTER TABLE "gh_next_issues_to_assignees" DROP CONSTRAINT "gh_next_issues_to_assignees_issue_id";--> statement-breakpoint
ALTER TABLE "gh_next_issues_to_assignees" ADD COLUMN "id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "gh_next_issues_to_assignees" ADD COLUMN "assignee_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issues_to_assignees" ADD CONSTRAINT "gh_next_issues_to_assignees_assignee_id_gh_next_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "gh_next_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
