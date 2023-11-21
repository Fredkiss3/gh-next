-- ADD A case insensitive COLUMN for the username
ALTER TABLE "gh_next_users" ADD COLUMN "username_ci" varchar(255) COLLATE "ci";
-- migrate data from the old column to the new column
UPDATE "gh_next_users" SET "username_ci" = "username";

ALTER TABLE "gh_next_users" DROP COLUMN "username"; -- remove the old column
ALTER TABLE "gh_next_users" RENAME COLUMN "username_ci" TO "username"; -- rename the new column to the old column
ALTER TABLE "gh_next_users" ALTER COLUMN  "username" SET NOT NULL; -- add the not-null constraint

CREATE UNIQUE INDEX "uname_uniq_idx" ON "gh_next_users" ("username"); -- readd the index-- Custom SQL migration file, put you code below! --