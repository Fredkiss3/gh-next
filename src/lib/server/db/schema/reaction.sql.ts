import {
  serial,
  integer,
  pgEnum,
  index,
  pgMaterializedView
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./user.sql";
import { issues } from "./issue.sql";
import { comments } from "./comment.sql";
import { pgTable } from "./index.sql";

import type { InferSelectModel } from "drizzle-orm";

export const ReactionTypes = {
  PLUS_ONE: "PLUS_ONE",
  MINUS_ONE: "MINUS_ONE",
  LAUGH: "LAUGH",
  CONFUSED: "CONFUSED",
  HEART: "HEART",
  HOORAY: "HOORAY",
  ROCKET: "ROCKET",
  EYES: "EYES"
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
  "EYES"
]);

export const reactions = pgTable(
  "reactions",
  {
    id: serial("id").primaryKey(),
    type: reactionTypeEnum("type").notNull(),
    author_id: integer("author_id").references(() => users.id, {
      onDelete: "set null"
    }),
    comment_id: integer("comment_id").references(() => comments.id, {
      onDelete: "cascade"
    }),
    issue_id: integer("issue_id").references(() => issues.id, {
      onDelete: "cascade"
    })
  },
  (table) => ({
    authorFKIdx: index("rakt_author_fk_idx").on(table.author_id),
    typeIdx: index("rakt_type_idx").on(table.type),
    issueFKIdx: index("rakt_issue_fk_idx").on(table.issue_id),
    commentFKIdx: index("rakt_comment_fk_idx").on(table.comment_id)
  })
);

export const reactionsCountPerIssue = pgMaterializedView(
  "reaction_count_per_issue"
).as((qb) =>
  qb
    .select({
      issue_id: reactions.issue_id,
      plus_one_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.PLUS_ONE} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("plus_one_count"),
      minus_one_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.MINUS_ONE} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("minus_one_count"),
      confused_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.CONFUSED} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("confused_count"),
      eyes_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.EYES} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("eyes_count"),
      heart_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.HEART} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("heart_count"),
      hooray_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.HOORAY} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("hooray_count"),
      laugh_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.LAUGH} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("laugh_count"),
      rocket_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.ROCKET} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("rocket_count")
    })
    .from(reactions)
    .groupBy(reactions.issue_id)
);

export const reactionsRelations = relations(reactions, ({ one }) => ({
  author: one(users, {
    fields: [reactions.author_id],
    references: [users.id],
    relationName: "reactions"
  }),
  issue: one(issues, {
    fields: [reactions.issue_id],
    references: [issues.id],
    relationName: "issue"
  }),
  comment: one(comments, {
    fields: [reactions.issue_id],
    references: [comments.id],
    relationName: "comment"
  })
}));

export type Reaction = InferSelectModel<typeof reactions>;
