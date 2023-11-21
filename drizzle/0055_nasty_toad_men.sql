-- ADD A case insensitive COLUMN for the username
ALTER TABLE "gh_next_comments" ADD COLUMN "author_username_ci" varchar(255) COLLATE "ci";
-- migrate data from the old column to the new column
UPDATE "gh_next_comments" SET "author_username_ci" = "author_username";

ALTER TABLE "gh_next_comments" DROP COLUMN "author_username"; -- remove the old column
ALTER TABLE "gh_next_comments" RENAME COLUMN "author_username_ci" TO "author_username"; -- rename the new column to the old column
ALTER TABLE "gh_next_comments" ALTER COLUMN  "author_username" SET NOT NULL; -- add the not-null constraint

CREATE INDEX "com_author_uname_idx" ON "gh_next_comments" ("author_username"); -- readd the index