-- Custom SQL migration file, put you code below! --
CREATE OR REPLACE FUNCTION refresh_comment_count_per_issue()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY comment_count_per_issue;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE OR REPLACE FUNCTION refresh_reaction_count_per_issue()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY reaction_count_per_issue;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint


CREATE TRIGGER trigger_refresh_comment_count
AFTER INSERT OR DELETE
ON gh_next_comments
FOR EACH ROW
EXECUTE FUNCTION refresh_comment_count_per_issue();--> statement-breakpoint

CREATE TRIGGER trigger_refresh_reaction_count
AFTER INSERT OR DELETE
ON gh_next_reactions
FOR EACH ROW
EXECUTE FUNCTION refresh_reaction_count_per_issue();
