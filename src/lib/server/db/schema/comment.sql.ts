import {
  serial,
  timestamp,
  text,
  integer,
  varchar,
  boolean,
  pgEnum,
  index,
  pgMaterializedView
} from "drizzle-orm/pg-core";
import { eq, relations, sql } from "drizzle-orm";
import { pgTable, tsVector } from "./index.sql";

import { users } from "./user.sql";
import { issues } from "./issue.sql";
import { reactions } from "./reaction.sql";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const commentHideReasonEnum = pgEnum("comment_hide_reason", [
  "ABUSE",
  "OFF_TOPIC",
  "OUTDATED",
  "RESOLVED",
  "DUPLICATE",
  "SPAM"
]);

export type CommentHideReason =
  (typeof commentHideReasonEnum)["enumValues"][number];

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    author_id: integer("author_id").references(() => users.id, {
      onDelete: "set null"
    }),
    author_username: varchar("author_username", { length: 255 }).notNull(),
    author_avatar_url: varchar("author_avatar_url", { length: 255 }).notNull(),
    issue_id: integer("issue_id")
      .references(() => issues.id, {
        onDelete: "cascade"
      })
      .notNull(),
    hidden: boolean("hidden").default(false).notNull(),
    hidden_reason: commentHideReasonEnum("hidden_reason")
  },
  (table) => ({
    authorFKIdx: index("com_author_fk_idx").on(table.author_id),
    authorUsernameIdx: index("com_author_uname_idx").on(table.author_username),
    issueFKIdx: index("com_issue_fk_idx").on(table.issue_id)
  })
);

export const commentsCountPerIssue = pgMaterializedView(
  "comment_count_per_issue"
).as((qb) =>
  qb
    .select({
      issue_id: comments.issue_id,
      comment_count: sql<number>`count(${comments.id})`
        .mapWith(Number)
        .as("comment_count")
    })
    .from(comments)
    .groupBy(comments.issue_id)
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.author_id],
    references: [users.id],
    relationName: "comments"
  }),
  parent: one(issues, {
    fields: [comments.issue_id],
    references: [issues.id],
    relationName: "issue"
  }),
  reactions: many(reactions),
  revisions: many(commentRevisions, {
    relationName: "comment"
  })
}));

export const commentRevisions = pgTable("comment_revisions", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  comment_id: integer("comment_id")
    .references(() => comments.id, {
      onDelete: "cascade"
    })
    .notNull(),
  updated_content: text("updated_content").notNull()
});

export const commentRevisionsRelations = relations(
  commentRevisions,
  ({ one }) => ({
    comment: one(comments, {
      fields: [commentRevisions.comment_id],
      references: [comments.id],
      relationName: "comment"
    })
  })
);

export type Comment = InferSelectModel<typeof comments>;
export type CommentInsert = InferInsertModel<typeof comments>;

export type CommentRevision = InferSelectModel<typeof commentRevisions>;

export type CommentRevisionInsert = InferInsertModel<typeof commentRevisions>;
