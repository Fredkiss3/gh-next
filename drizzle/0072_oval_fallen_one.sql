CREATE OR REPLACE FUNCTION sync_author_username_insert()
RETURNS TRIGGER AS $$
BEGIN
    NEW.author_username_cs := NEW.author_username;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER iss_author_username_insert_trigger
BEFORE INSERT ON gh_next_issues
FOR EACH ROW EXECUTE FUNCTION sync_author_username_insert();

CREATE OR REPLACE FUNCTION sync_author_username_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync from username to username_cs
    IF NEW.author_username IS DISTINCT FROM OLD.author_username THEN
        NEW.author_username_cs := NEW.author_username;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER iss_author_username_update_trigger
BEFORE UPDATE ON gh_next_issues
FOR EACH ROW EXECUTE FUNCTION sync_author_username_update();
