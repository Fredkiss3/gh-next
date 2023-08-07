import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./user";
import { issues } from "./issue";
import { comments } from "./comment";

import type { InferModel } from "drizzle-orm";

export const ReactionTypes = {
  PLUS_ONE: "PLUS_ONE",
  MINUS_ONE: "MINUS_ONE",
  LAUGH: "LAUGH",
  CONFUSED: "CONFUSED",
  HEART: "HEART",
  HOORAY: "HOORAY",
  ROCKET: "ROCKET",
  EYES: "EYES",
} as const;
export type ReactionType = keyof typeof ReactionTypes;

export const reactions = sqliteTable("reactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", {
    enum: [
      "PLUS_ONE",
      "MINUS_ONE",
      "LAUGH",
      "CONFUSED",
      "HEART",
      "HOORAY",
      "ROCKET",
      "EYES",
    ],
  }).notNull(),
  author_id: integer("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  comment_id: integer("comment_id").references(() => comments.id, {
    onDelete: "cascade",
  }),
  issue_id: integer("issue_id").references(() => issues.id, {
    onDelete: "cascade",
  }),
});

export const reactionsRelations = relations(reactions, ({ one }) => ({
  author: one(users, {
    fields: [reactions.author_id],
    references: [users.id],
    relationName: "reactions",
  }),
  issue: one(issues, {
    fields: [reactions.issue_id],
    references: [issues.id],
    relationName: "issue",
  }),
  comment: one(comments, {
    fields: [reactions.issue_id],
    references: [comments.id],
    relationName: "comment",
  }),
}));

export type Reaction = InferModel<typeof reactions>;
