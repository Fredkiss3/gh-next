import { pgTable, serial, timestamp, text, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { users } from "./user";
import { issues } from "./issue";
import { reactions } from "./reaction";

import type { InferModel } from "drizzle-orm";

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  author_id: integer("author_id")
    .references(() => users.id)
    .notNull(),
  issue_id: integer("issue_id")
    .references(() => issues.id)
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

export const commentRevisions = pgTable("comment_revisions", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  comment_id: integer("comment_id")
    .references(() => comments.id)
    .notNull(),
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
