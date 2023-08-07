import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

import { users } from "./user";
import { issues } from "./issue";
import { reactions } from "./reaction";

import type { InferModel } from "drizzle-orm";

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  created_at: integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  author_id: integer("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  issue_id: integer("issue_id")
    .references(() => issues.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.author_id],
    references: [users.id],
    relationName: "comments",
  }),
  parent: one(issues, {
    fields: [comments.issue_id],
    references: [issues.id],
    relationName: "issue",
  }),
  reactions: many(reactions),
  revisions: many(commentRevisions, {
    relationName: "comment",
  }),
}));

export const commentRevisions = sqliteTable("comment_revisions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  created_at: integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  comment_id: integer("comment_id")
    .references(() => comments.id, {
      onDelete: "cascade",
    })
    .notNull(),
  updated_content: text("updated_content").notNull(),
});

export const commentRevisionsRelations = relations(
  commentRevisions,
  ({ one }) => ({
    comment: one(comments, {
      fields: [commentRevisions.comment_id],
      references: [comments.id],
      relationName: "comment",
    }),
  })
);

export type Comment = InferModel<typeof comments>;
export type CommentRevision = InferModel<typeof commentRevisions>;
