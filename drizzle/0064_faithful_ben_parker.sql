CREATE OR REPLACE FUNCTION sync_username_insert()
RETURNS TRIGGER AS $$
BEGIN
    NEW.assignee_username_cs := NEW.assignee_username;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER username_insert_trigger
BEFORE INSERT ON gh_next_issues_to_assignees
FOR EACH ROW EXECUTE FUNCTION sync_username_insert();

CREATE OR REPLACE FUNCTION sync_username_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync from username to username_cs
    IF NEW.assignee_username IS DISTINCT FROM OLD.assignee_username THEN
        NEW.assignee_username_cs := NEW.assignee_username;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER username_update_trigger
BEFORE UPDATE ON gh_next_issues_to_assignees
FOR EACH ROW EXECUTE FUNCTION sync_username_update();
