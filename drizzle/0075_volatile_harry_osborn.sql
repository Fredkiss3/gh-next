ALTER TABLE "gh_next_repositories" ADD COLUMN "description" text DEFAULT '' NOT NULL;
UPDATE "gh_next_repositories" SET "description" = 'A minimal Github clone built on nextjs app router.' WHERE 1=1;