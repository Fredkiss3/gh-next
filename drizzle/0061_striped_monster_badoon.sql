-- ADD A case insensitive COLUMN for the username
ALTER TABLE "gh_next_issues_to_assignees" ADD COLUMN "assignee_username_ci" varchar(255) COLLATE "ci";
-- migrate data from the old column to the new column
UPDATE "gh_next_issues_to_assignees" SET "assignee_username_ci" = "assignee_username";

ALTER TABLE "gh_next_issues_to_assignees" DROP COLUMN "assignee_username"; -- remove the old column
ALTER TABLE "gh_next_issues_to_assignees" RENAME COLUMN "assignee_username_ci" TO "assignee_username"; -- rename the new column to the old column
ALTER TABLE "gh_next_issues_to_assignees" ALTER COLUMN  "assignee_username" SET NOT NULL; -- add the not-null constraint
