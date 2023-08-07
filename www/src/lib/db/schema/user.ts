import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { relations, type InferModel } from "drizzle-orm";
import { issueToAssignees, issueUserSubscriptions, issues } from "./issue";
import { reactions } from "./reaction";
import { comments } from "./comment";

export const THEMES = ["dark", "light", "system"] as const;

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username", { length: 255 }).notNull(),
    github_id: text("github_id", { length: 255 }).notNull(),
    avatar_url: text("avatar_url", { length: 255 }).notNull(),
    name: text("name", { length: 255 }),
    bio: text("bio"),
    location: text("location", { length: 255 }),
    preferred_theme: text("preferred_theme", { enum: THEMES })
      .default("system")
      .notNull(),
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
  assignedIssues: many(issueToAssignees, {
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
export type Theme = (typeof THEMES)[number];
