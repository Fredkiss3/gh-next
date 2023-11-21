ALTER TABLE "gh_next_issues_to_assignees" ADD COLUMN "assignee_username_cs" varchar(255);

-- copy data from the ci column to the cs column
UPDATE "gh_next_issues_to_assignees" SET "assignee_username_cs" = "assignee_username";

ALTER TABLE "gh_next_issues_to_assignees" ALTER COLUMN  "assignee_username_cs" SET NOT NULL; -- add the not-null constraint