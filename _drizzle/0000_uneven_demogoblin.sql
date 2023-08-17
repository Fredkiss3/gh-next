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
CREATE TABLE IF NOT EXISTS "assign_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"initiator_id" integer NOT NULL,
	"issue_id" integer NOT NULL,
	"assignee_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "change_title_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"initiator_id" integer NOT NULL,
	"issue_id" integer NOT NULL,
	"old_title" varchar(255) NOT NULL,
	"new_title" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "edit_activity_to_labels" (
	"activity_id" integer NOT NULL,
	"label_id" integer NOT NULL,
	"action" "edit_activity_action" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "edit_activity_to_labels" ADD CONSTRAINT "edit_activity_to_labels_activity_id_label_id" PRIMARY KEY("activity_id","label_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "edit_labels_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"initiator_id" integer NOT NULL,
	"issue_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issue_mention_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"initiator_id" integer NOT NULL,
	"issue_id" integer NOT NULL,
	"mentionned_issue_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issue_toggle_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"initiator_id" integer NOT NULL,
	"issue_id" integer NOT NULL,
	"status" "issue_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issue_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revised_by_id" integer NOT NULL,
	"issue_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"author_id" integer NOT NULL,
	"issue_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issue_user_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"issue_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" "issue_status" DEFAULT 'OPEN' NOT NULL,
	"author_id" integer NOT NULL,
	"assignee_id" integer,
	"is_locked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "labels_to_issues" (
	"issue_id" integer NOT NULL,
	"label_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "labels_to_issues" ADD CONSTRAINT "labels_to_issues_issue_id_label_id" PRIMARY KEY("issue_id","label_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "labels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) DEFAULT '' NOT NULL,
	"color" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "reaction_type" NOT NULL,
	"author_id" integer NOT NULL,
	"comment_id" integer,
	"issue_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"github_id" varchar(255) NOT NULL,
	"avatar_url" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "usernameIdx" ON "users" ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ghIdIdx" ON "users" ("github_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assign_activities" ADD CONSTRAINT "assign_activities_initiator_id_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assign_activities" ADD CONSTRAINT "assign_activities_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assign_activities" ADD CONSTRAINT "assign_activities_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "change_title_activities" ADD CONSTRAINT "change_title_activities_initiator_id_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "change_title_activities" ADD CONSTRAINT "change_title_activities_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edit_activity_to_labels" ADD CONSTRAINT "edit_activity_to_labels_activity_id_edit_labels_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "edit_labels_activities"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edit_activity_to_labels" ADD CONSTRAINT "edit_activity_to_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edit_labels_activities" ADD CONSTRAINT "edit_labels_activities_initiator_id_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edit_labels_activities" ADD CONSTRAINT "edit_labels_activities_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issue_mention_activities" ADD CONSTRAINT "issue_mention_activities_initiator_id_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issue_mention_activities" ADD CONSTRAINT "issue_mention_activities_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issue_mention_activities" ADD CONSTRAINT "issue_mention_activities_mentionned_issue_id_issues_id_fk" FOREIGN KEY ("mentionned_issue_id") REFERENCES "issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issue_toggle_activities" ADD CONSTRAINT "issue_toggle_activities_initiator_id_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issue_toggle_activities" ADD CONSTRAINT "issue_toggle_activities_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issue_revisions" ADD CONSTRAINT "issue_revisions_revised_by_id_users_id_fk" FOREIGN KEY ("revised_by_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issue_revisions" ADD CONSTRAINT "issue_revisions_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issue_user_subscriptions" ADD CONSTRAINT "issue_user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issue_user_subscriptions" ADD CONSTRAINT "issue_user_subscriptions_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues" ADD CONSTRAINT "issues_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "issues" ADD CONSTRAINT "issues_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "labels_to_issues" ADD CONSTRAINT "labels_to_issues_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "labels_to_issues" ADD CONSTRAINT "labels_to_issues_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
