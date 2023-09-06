import "server-only";

import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { issues } from "~/lib/server/db/schema/issue.sql";
import { users } from "~/lib/server/db/schema/user.sql";

export const issueListOutputValidator = z.object({
  noOfIssuesOpen: z.number(),
  noOfIssuesClosed: z.number(),
  totalCount: z.number(),
  issues: z.array(
    z
      .object({
        id: z.number(),
        title: z.string(),
        description: z.string().optional(),
        assigned_to: z.array(
          z.object({
            username: z.string(),
            avatar_url: z.string().url()
          })
        ),
        author: createSelectSchema(users).pick({
          username: true,
          name: true,
          bio: true,
          location: true,
          avatar_url: true
        }),
        noOfComments: z.number(),
        created_at: z.date(),
        status_updated_at: z.date(),
        labels: z.array(
          z.object({
            id: z.number(),
            color: z.string(),
            name: z.string(),
            description: z.string().optional()
          })
        )
      })
      .merge(
        createSelectSchema(issues).pick({
          status: true
        })
      )
  )
});

export type IssueListResult = z.TypeOf<typeof issueListOutputValidator>;
