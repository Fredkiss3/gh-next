-- ADD A case insensitive COLUMN for the username
ALTER TABLE "gh_next_repositories" ADD COLUMN "name_ci" varchar(255) COLLATE "ci";
-- migrate data from the old column to the new column
UPDATE "gh_next_repositories" SET "name_ci" = "name";

ALTER TABLE "gh_next_repositories" DROP COLUMN "name"; -- remove the old column
ALTER TABLE "gh_next_repositories" RENAME COLUMN "name_ci" TO "name"; -- rename the new column to the old column
ALTER TABLE "gh_next_repositories" ALTER COLUMN  "name" SET NOT NULL; -- add the not-null constraint

CREATE UNIQUE INDEX "repo_name_uniq_idx" ON "gh_next_repositories" ("name"); -- readd the unique constraint--