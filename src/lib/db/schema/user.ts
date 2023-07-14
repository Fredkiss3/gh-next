import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { relations, type InferModel } from "drizzle-orm";
import { issueUserSubscriptions, issues } from "./issue";
import { reactions } from "./reaction";
import { comments } from "./comment";

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull(),
    github_id: text("github_id").notNull(),
    avatar_url: text("avatar_url").notNull(),
  },
  (users) => ({
    usernameIdx: uniqueIndex("usernameIdx").on(users.username),
    ghIdIdx: uniqueIndex("ghIdIdx").on(users.github_id),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  createdIssues: many(issues, {
    relationName: "author",
  }),
  assignedIssues: many(issues, {
    relationName: "assignee",
  }),
  reactions: many(reactions, {
    relationName: "reactions",
  }),
  comments: many(comments, {
    relationName: "comments",
  }),
  subcriptions: many(issueUserSubscriptions, {
    relationName: "user",
  }),
}));

export type User = InferModel<typeof users>;
