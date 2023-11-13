CREATE TABLE IF NOT EXISTS "gh_next_repositories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"creator_id" integer,
	"is_archived" boolean DEFAULT false,
	CONSTRAINT "gh_next_repositories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "gh_next_issues" ADD COLUMN "repository_id" integer;--> statement-breakpoint

--> make it so that there is no issue without a repo attached
WITH inserted AS (
  INSERT INTO gh_next_repositories (name, creator_id) 
  VALUES (
      'gh-next', 
      (
          SELECT id FROM gh_next_users WHERE username = 'Fredkiss3' LIMIT 1
      )
  )
  ON CONFLICT (name) DO NOTHING
  RETURNING id
) 
UPDATE gh_next_issues SET repository_id=(SELECT id FROM inserted) WHERE 1=1;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "name_idx" ON "gh_next_repositories" ("name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_issues" ADD CONSTRAINT "gh_next_issues_repository_id_gh_next_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "gh_next_repositories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gh_next_repositories" ADD CONSTRAINT "gh_next_repositories_creator_id_gh_next_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "gh_next_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
