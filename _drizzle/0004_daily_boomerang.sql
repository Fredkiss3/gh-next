CREATE TABLE IF NOT EXISTS "issues_to_assignees" (
	"assignee_id" integer NOT NULL,
	"issue_id" integer NOT NULL,
	CONSTRAINT issues_to_assignees_issue_id_assignee_id PRIMARY KEY("issue_id","assignee_id")
);
--> statement-breakpoint
ALTER TABLE "issues" DROP CONSTRAINT "issues_assignee_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "issues" DROP COLUMN IF EXISTS "assignee_id";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues_to_assignees" ADD CONSTRAINT "issues_to_assignees_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues_to_assignees" ADD CONSTRAINT "issues_to_assignees_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
