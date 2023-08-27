DO $$ BEGIN
 CREATE TYPE "edit_activity_action" AS ENUM('REMOVED', 'ADDED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "issue_status" AS ENUM('OPEN', 'CLOSED', 'NOT_PLANNED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "reaction_type" AS ENUM('PLUS_ONE', 'MINUS_ONE', 'LAUGH', 'CONFUSED', 'HEART', 'HOORAY', 'ROCKET', 'EYES');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "themes" AS ENUM('dark', 'light', 'system');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_assign_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"initiator_id" integer,
	"issue_id" integer NOT NULL,
	"assignee_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_change_title_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"initiator_id" integer,
	"issue_id" integer NOT NULL,
	"old_title" varchar(255) NOT NULL,
	"new_title" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_edit_activity_to_labels" (
	"activity_id" integer NOT NULL,
	"label_id" integer NOT NULL,
	"action" "edit_activity_action" NOT NULL,
	CONSTRAINT gh_next_edit_activity_to_labels_activity_id_label_id PRIMARY KEY("activity_id","label_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_edit_labels_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"initiator_id" integer,
	"issue_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_issue_mention_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"initiator_id" integer,
	"issue_id" integer NOT NULL,
	"mentionned_issue_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_issue_toggle_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"initiator_id" integer,
	"issue_id" integer NOT NULL,
	"status" "issue_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_comment_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"comment_id" integer NOT NULL,
	"updated_content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"author_id" integer,
	"issue_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_issue_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revised_by_id" integer NOT NULL,
	"issue_id" integer NOT NULL,
	"updated_description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_issues_to_assignees" (
	"assignee_id" integer NOT NULL,
	"issue_id" integer NOT NULL,
	CONSTRAINT gh_next_issues_to_assignees_issue_id_assignee_id PRIMARY KEY("issue_id","assignee_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_issue_user_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"issue_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" "issue_status" DEFAULT 'OPEN' NOT NULL,
	"author_id" integer,
	"assignee_id" integer,
	"is_locked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_labels_to_issues" (
	"issue_id" integer NOT NULL,
	"label_id" integer NOT NULL,
	CONSTRAINT gh_next_labels_to_issues_issue_id_label_id PRIMARY KEY("issue_id","label_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_labels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) DEFAULT '' NOT NULL,
	"color" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "reaction_type" NOT NULL,
	"author_id" integer,
	"comment_id" integer,
	"issue_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gh_next_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"github_id" varchar(255) NOT NULL,
	"avatar_url" varchar(255) NOT NULL,
	"name" varchar(255),
	"bio" text,
	"location" varchar(255),
	"preferred_theme" "themes" DEFAULT 'system' NOT NULL,
	CONSTRAINT "gh_next_users_username_unique" UNIQUE("username"),
	CONSTRAINT "gh_next_users_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_assign_activities" ADD CONSTRAINT "gh_next_assign_activities_initiator_id_gh_next_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "gh_next_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_assign_activities" ADD CONSTRAINT "gh_next_assign_activities_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_assign_activities" ADD CONSTRAINT "gh_next_assign_activities_assignee_id_gh_next_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "gh_next_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_change_title_activities" ADD CONSTRAINT "gh_next_change_title_activities_initiator_id_gh_next_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "gh_next_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_change_title_activities" ADD CONSTRAINT "gh_next_change_title_activities_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_edit_activity_to_labels" ADD CONSTRAINT "gh_next_edit_activity_to_labels_activity_id_gh_next_edit_labels_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "gh_next_edit_labels_activities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_edit_activity_to_labels" ADD CONSTRAINT "gh_next_edit_activity_to_labels_label_id_gh_next_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "gh_next_labels"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_edit_labels_activities" ADD CONSTRAINT "gh_next_edit_labels_activities_initiator_id_gh_next_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "gh_next_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_edit_labels_activities" ADD CONSTRAINT "gh_next_edit_labels_activities_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_mention_activities" ADD CONSTRAINT "gh_next_issue_mention_activities_initiator_id_gh_next_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "gh_next_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_mention_activities" ADD CONSTRAINT "gh_next_issue_mention_activities_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_mention_activities" ADD CONSTRAINT "gh_next_issue_mention_activities_mentionned_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("mentionned_issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_toggle_activities" ADD CONSTRAINT "gh_next_issue_toggle_activities_initiator_id_gh_next_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "gh_next_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_toggle_activities" ADD CONSTRAINT "gh_next_issue_toggle_activities_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_comment_revisions" ADD CONSTRAINT "gh_next_comment_revisions_comment_id_gh_next_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "gh_next_comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_comments" ADD CONSTRAINT "gh_next_comments_author_id_gh_next_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "gh_next_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_comments" ADD CONSTRAINT "gh_next_comments_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_revisions" ADD CONSTRAINT "gh_next_issue_revisions_revised_by_id_gh_next_users_id_fk" FOREIGN KEY ("revised_by_id") REFERENCES "gh_next_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_revisions" ADD CONSTRAINT "gh_next_issue_revisions_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issues_to_assignees" ADD CONSTRAINT "gh_next_issues_to_assignees_assignee_id_gh_next_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "gh_next_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issues_to_assignees" ADD CONSTRAINT "gh_next_issues_to_assignees_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_user_subscriptions" ADD CONSTRAINT "gh_next_issue_user_subscriptions_user_id_gh_next_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "gh_next_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issue_user_subscriptions" ADD CONSTRAINT "gh_next_issue_user_subscriptions_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issues" ADD CONSTRAINT "gh_next_issues_author_id_gh_next_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "gh_next_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issues" ADD CONSTRAINT "gh_next_issues_assignee_id_gh_next_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "gh_next_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_labels_to_issues" ADD CONSTRAINT "gh_next_labels_to_issues_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_labels_to_issues" ADD CONSTRAINT "gh_next_labels_to_issues_label_id_gh_next_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "gh_next_labels"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_reactions" ADD CONSTRAINT "gh_next_reactions_author_id_gh_next_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "gh_next_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_reactions" ADD CONSTRAINT "gh_next_reactions_comment_id_gh_next_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "gh_next_comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_reactions" ADD CONSTRAINT "gh_next_reactions_issue_id_gh_next_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "gh_next_issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
