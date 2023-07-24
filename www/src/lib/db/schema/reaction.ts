import { pgTable, serial, integer, pgEnum } from "drizzle-orm/pg-core";
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

export const reactionTypeEnum = pgEnum("reaction_type", [
  "PLUS_ONE",
  "MINUS_ONE",
  "LAUGH",
  "CONFUSED",
  "HEART",
  "HOORAY",
  "ROCKET",
  "EYES",
]);

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  type: reactionTypeEnum("type").notNull(),
  author_id: integer("author_id")
    .references(() => users.id)
    .notNull(),
  comment_id: integer("comment_id").references(() => comments.id),
  issue_id: integer("issue_id").references(() => issues.id),
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
