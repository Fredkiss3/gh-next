DROP TRIGGER IF EXISTS "username_update_trigger" ON "gh_next_issues_to_assignees";  
DROP TRIGGER IF EXISTS "username_insert_trigger" ON "gh_next_issues_to_assignees";
ALTER TABLE "gh_next_issues_to_assignees" DROP COLUMN IF EXISTS "assignee_username_cs";