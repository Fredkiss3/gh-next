-- ADD A case insensitive COLUMN for the username
ALTER TABLE "gh_next_issue_events" ADD COLUMN "initiator_username_ci" varchar(255) COLLATE "ci";
-- migrate data from the old column to the new column
UPDATE "gh_next_issue_events" SET "initiator_username_ci" = "initiator_username";

ALTER TABLE "gh_next_issue_events" DROP COLUMN "initiator_username"; -- remove the old column
ALTER TABLE "gh_next_issue_events" RENAME COLUMN "initiator_username_ci" TO "initiator_username"; -- rename the new column to the old column
ALTER TABLE "gh_next_issue_events" ALTER COLUMN  "initiator_username" SET NOT NULL; -- add the not-null constraint
