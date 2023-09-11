ALTER TABLE "gh_next_issues_to_assignees" DROP CONSTRAINT "gh_next_issues_to_assignees_issue_id_assignee_id";--> statement-breakpoint
ALTER TABLE "gh_next_issues_to_assignees" DROP CONSTRAINT "gh_next_issues_to_assignees_assignee_id_gh_next_users_id_fk";
--> statement-breakpoint
ALTER TABLE "gh_next_issues_to_assignees" ADD COLUMN "assignee_username" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "gh_next_issues_to_assignees" ADD COLUMN "assignee_avatar_url" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "gh_next_issues_to_assignees" DROP COLUMN IF EXISTS "assignee_id";--> statement-breakpoint
ALTER TABLE "gh_next_issues_to_assignees" ADD CONSTRAINT "gh_next_issues_to_assignees_issue_id" PRIMARY KEY("issue_id");