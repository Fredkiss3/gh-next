import "server-only";

import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { issues } from "~/lib/server/db/schema/issue.sql";

export const issueSearchListOutputValidator = z.object({
  noOfIssuesOpen: z.number(),
  noOfIssuesClosed: z.number(),
  totalCount: z.number(),
  issues: z.array(
    z
      .object({
        plus_one_count: z.number().catch(0),
        minus_one_count: z.number().catch(0),
        confused_count: z.number().catch(0),
        eyes_count: z.number().catch(0),
        heart_count: z.number().catch(0),
        hooray_count: z.number().catch(0),
        laugh_count: z.number().catch(0),
        rocket_count: z.number().catch(0),
        number: z.number(),
        title: z.string(),
        excerpt: z.string().optional(),
        assigned_to: z.array(
          z.object({
            username: z.string(),
            avatar_url: z.string().url()
          })
        ),
        author: z.object({
          id: z.number().nullable(),
          username: z.string(),
          avatar_url: z.string(),
          bio: z.string().nullable(),
          location: z.string().nullable(),
          name: z.string().nullable()
        }),
        no_of_comments: z.number(),
        created_at: z.date(),
        status_updated_at: z.date(),
        labels: z.array(
          z.object({
            id: z.number(),
            color: z.string(),
            name: z.string(),
            description: z.string().optional()
          })
        ),
        mentioned_user: z.string().nullable(),
        commented_user: z.string().nullable()
      })
      .merge(
        createSelectSchema(issues).pick({
          status: true
        })
      )
  )
});

export type IssueSearchListResult = z.TypeOf<
  typeof issueSearchListOutputValidator
>;

export type IssueSearchItem = IssueSearchListResult["issues"][number];
