import {
  serial,
  timestamp,
  text,
  integer,
  varchar,
  boolean,
  pgEnum,
  index
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
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
    content_search_vector: tsVector("content_search_vector"),
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
    contentSVIdx: index("content_search_vector_idex")
      .on(table.content_search_vector)
      .using(sql`gin(${table.content_search_vector})`)
  })
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
