-- Custom SQL migration file, put you code below! --
CREATE MATERIALIZED VIEW comment_count_per_issue AS
SELECT
    issue_id,
    COUNT(id) AS comment_count
FROM
    gh_next_comments
GROUP BY
    issue_id; --> statement-breakpoint

CREATE MATERIALIZED VIEW reaction_count_per_issue AS
SELECT
    issue_id,
    COALESCE(SUM(CASE WHEN type = 'PLUS_ONE' THEN 1 ELSE 0 END), 0) AS plus_one_count,
    COALESCE(SUM(CASE WHEN type = 'MINUS_ONE' THEN 1 ELSE 0 END), 0) AS minus_one_count,
    COALESCE(SUM(CASE WHEN type = 'CONFUSED' THEN 1 ELSE 0 END), 0) AS confused_count,
    COALESCE(SUM(CASE WHEN type = 'EYES' THEN 1 ELSE 0 END), 0) AS eyes_count,
    COALESCE(SUM(CASE WHEN type = 'HEART' THEN 1 ELSE 0 END), 0) AS heart_count,
    COALESCE(SUM(CASE WHEN type = 'HOORAY' THEN 1 ELSE 0 END), 0) AS hooray_count,
    COALESCE(SUM(CASE WHEN type = 'LAUGH' THEN 1 ELSE 0 END), 0) AS laugh_count,
    COALESCE(SUM(CASE WHEN type = 'ROCKET' THEN 1 ELSE 0 END), 0) AS rocket_count
FROM
    gh_next_reactions
GROUP BY
    issue_id;
