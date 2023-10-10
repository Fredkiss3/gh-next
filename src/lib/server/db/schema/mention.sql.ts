import { integer, serial, unique, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "./index.sql";
import { issues } from "./issue.sql";
import { comments } from "./comment.sql";

import {
  relations,
  type InferInsertModel,
  type InferSelectModel
} from "drizzle-orm";

export const issueUserMentions = pgTable(
  "issue_user_mentions",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    issue_id: integer("issue_id")
      .references(() => issues.id, {
        onDelete: "cascade"
      })
      .notNull(),
    comment_id: integer("comment_id").references(() => comments.id, {
      onDelete: "cascade"
    })
  },
  (table) => ({
    unique_idx: unique().on(table.username, table.issue_id, table.comment_id)
  })
);

export const issueMentionsRelations = relations(
  issueUserMentions,
  ({ one }) => ({
    comment: one(comments, {
      fields: [issueUserMentions.comment_id],
      references: [comments.id],
      relationName: "mentionning_comment"
    }),
    issue: one(issues, {
      fields: [issueUserMentions.issue_id],
      references: [issues.id],
      relationName: "mentionning_issue"
    })
  })
);

export type IssueUserMention = InferSelectModel<typeof issueUserMentions>;
export type IssueUserMentionInsert = InferInsertModel<typeof issueUserMentions>;
