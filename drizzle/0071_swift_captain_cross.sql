-- Custom SQL migration file, put you code below! --
CREATE TRIGGER iss_2_ass_assignee_username_update_trigger
BEFORE UPDATE ON gh_next_issues_to_assignees
FOR EACH ROW EXECUTE FUNCTION sync_username_update();

CREATE TRIGGER iss_2_ass_assignee_username_insert_trigger
BEFORE INSERT ON gh_next_issues_to_assignees
FOR EACH ROW EXECUTE FUNCTION sync_username_insert();