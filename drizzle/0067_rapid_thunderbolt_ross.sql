
-- copy data from the ci column to the cs column
UPDATE "gh_next_issues" SET "author_username_cs" = "author_username";

ALTER TABLE "gh_next_issues" ALTER COLUMN  "author_username_cs" SET NOT NULL; -- add the not-null constraint