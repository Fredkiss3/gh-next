-- ADD A case insensitive COLUMN for the username
ALTER TABLE "gh_next_issue_events" ADD COLUMN "assignee_username_ci" varchar(255) COLLATE "ci";
-- migrate data from the old column to the new column
UPDATE "gh_next_issue_events" SET "assignee_username_ci" = "assignee_username";

ALTER TABLE "gh_next_issue_events" DROP COLUMN "assignee_username"; -- remove the old column
ALTER TABLE "gh_next_issue_events" RENAME COLUMN "assignee_username_ci" TO "assignee_username"; -- rename the new column to the old column
