ALTER TABLE "gh_next_issues" DROP CONSTRAINT "gh_next_issues_number_unique";--> statement-breakpoint
ALTER TABLE "gh_next_issues" ADD CONSTRAINT "uniq_number_idx" UNIQUE("repository_id","number");