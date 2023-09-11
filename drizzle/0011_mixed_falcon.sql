DO $$ BEGIN
 CREATE TYPE "event_type" AS ENUM('CHANGE_TITLE', 'TOGGLE_STATUS', 'ISSUE_MENTION', 'ASSIGN_USER', 'ADD_LABEL', 'REMOVE_LABEL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_issue_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"initiator_id" integer,
	"initiator_username" varchar(255) NOT NULL,
	"initiator_avatar_url" varchar(255) NOT NULL,
	"issue_id" integer NOT NULL,
	"type" "event_type" NOT NULL,
	"old_title" varchar(255),
	"new_title" varchar(255),
	"status" "issue_status",
	"mentionned_issue_id" integer,
	"assignee_id" integer,
	"label_id" integer
);
--> statement-breakpoint
DROP TABLE "gh_next_assign_activities";--> statement-breakpoint
DROP TABLE "gh_next_change_title_activities";--> statement-breakpoint
DROP TABLE "gh_next_edit_activity_to_labels";--> statement-breakpoint
DROP TABLE "gh_next_edit_labels_activities";--> statement-breakpoint
DROP TABLE "gh_next_issue_mention_activities";--> statement-breakpoint
DROP TABLE "gh_next_issue_toggle_activities";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_events" ADD CONSTRAINT "gh_next_issue_events_initiator_id_gh_next_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "gh_next_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_events" ADD CONSTRAINT "gh_next_issue_events_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_events" ADD CONSTRAINT "gh_next_issue_events_mentionned_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("mentionned_issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_events" ADD CONSTRAINT "gh_next_issue_events_assignee_id_gh_next_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "gh_next_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_events" ADD CONSTRAINT "gh_next_issue_events_label_id_gh_next_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "gh_next_labels"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
