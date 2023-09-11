ALTER TYPE event_type RENAME TO event_type_old;
CREATE TYPE event_type AS ENUM('CHANGE_TITLE', 'TOGGLE_STATUS', 'ISSUE_MENTION', 'ASSIGN_USER', 'ADD_LABEL', 'REMOVE_LABEL', 'ADD_COMMENT');
ALTER TABLE gh_next_issue_events ALTER COLUMN type TYPE event_type USING type::text::event_type;