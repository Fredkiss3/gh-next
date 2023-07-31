import {
  pgEnum,
  pgTable,
  serial,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { relations, type InferModel } from "drizzle-orm";
import { issueToAssignees, issueUserSubscriptions, issues } from "./issue";
import { reactions } from "./reaction";
import { comments } from "./comment";

export const THEMES = ["dark", "light", "system"] as const;
export const userThemeEnum = pgEnum("user_theme", THEMES);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    bio: text("bio"),
    location: varchar("location", { length: 255 }),
    github_id: varchar("github_id", { length: 255 }).notNull(),
    avatar_url: varchar("avatar_url", { length: 255 }).notNull(),
    preferred_theme: userThemeEnum("preferred_theme").default("system"),
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
