import { relations, type InferModel, type InferSelectModel } from "drizzle-orm";
import { issueToAssignees, issueUserSubscriptions, issues } from "./issue.sql";
import { reactions } from "./reaction.sql";
import { comments } from "./comment.sql";
import { pgTable } from "./index.sql";
import { pgEnum, serial, text, varchar } from "drizzle-orm/pg-core";

export const THEMES = ["dark", "light", "system"] as const;
export const themesEnum = pgEnum("themes", THEMES);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  github_id: varchar("github_id", { length: 255 }).notNull().unique(),
  avatar_url: varchar("avatar_url", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  company: varchar("company", { length: 255 }),
  preferred_theme: themesEnum("preferred_theme").default("system").notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
  createdIssues: many(issues, {
    relationName: "author"
  }),
  assignedIssues: many(issueToAssignees, {
    relationName: "assignee"
  }),
  reactions: many(reactions, {
    relationName: "reactions"
  }),
  comments: many(comments, {
    relationName: "comments"
  }),
  subcriptions: many(issueUserSubscriptions, {
    relationName: "user"
  })
}));

export type User = InferSelectModel<typeof users>;
export type Theme = (typeof THEMES)[number];
