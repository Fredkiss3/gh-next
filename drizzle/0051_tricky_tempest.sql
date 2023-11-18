-- Custom SQL migration file, put you code below! --
-- Custom SQL migration file, put you code below! --
CREATE OR REPLACE FUNCTION refresh_comment_count_per_issue()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW comment_count_per_issue;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE OR REPLACE FUNCTION refresh_reaction_count_per_issue()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW reaction_count_per_issue;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
