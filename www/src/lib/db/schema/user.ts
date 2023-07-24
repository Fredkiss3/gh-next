import { pgTable, serial, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { relations, type InferModel } from "drizzle-orm";
import { issueUserSubscriptions, issues } from "./issue";
import { reactions } from "./reaction";
import { comments } from "./comment";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    github_id: varchar("github_id", { length: 255 }).notNull(),
    avatar_url: varchar("avatar_url", { length: 255 }).notNull(),
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
