CREATE INDEX IF NOT EXISTS "lbl_2_iss_issue_fk_index" ON "gh_next_labels_to_issues" ("issue_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lbl_2_iss_assignee_fk_index" ON "gh_next_labels_to_issues" ("label_id");