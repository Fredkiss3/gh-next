-- ADD A case insensitive COLUMN for the username
ALTER TABLE "gh_next_issue_user_mentions" ADD COLUMN "username_ci" varchar(255) COLLATE "ci";
-- migrate data from the old column to the new column
UPDATE "gh_next_issue_user_mentions" SET "username_ci" = "username";

ALTER TABLE "gh_next_issue_user_mentions" DROP COLUMN "username"; -- remove the old column
ALTER TABLE "gh_next_issue_user_mentions" RENAME COLUMN "username_ci" TO "username"; -- rename the new column to the old column
ALTER TABLE "gh_next_issue_user_mentions" ALTER COLUMN  "username" SET NOT NULL; -- add the not-null constraint

CREATE INDEX "ment_username_idx" ON "gh_next_issue_user_mentions" ("username"); -- readd the index