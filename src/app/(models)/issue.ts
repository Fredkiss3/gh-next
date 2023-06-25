import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./user";
import { labelToIssues } from "./label";
import { comments } from "./comment";
import { reactions } from "./reaction";

import type { InferModel } from "drizzle-orm";
import {
  assignActivities,
  changeTitleActivities,
  editLabelsActivities,
  mentionActivities,
  toggleActivities,
} from "./activity";

export const IssueStatuses = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  NOT_PLANNED: "NOT_PLANNED",
} as const;

export const issues = sqliteTable("issues", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").default("").notNull(),
  created_at: integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  status: text("status")
    .default(IssueStatuses.OPEN)
    .$type<IssueStatus>()
    .notNull(),
  author_id: integer("author_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  assignee_id: integer("assignee_id").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const issuesRelations = relations(issues, ({ one, many }) => ({
  author: one(users, {
    fields: [issues.author_id],
    references: [users.id],
    relationName: "author",
  }),
  assignee: one(users, {
    fields: [issues.assignee_id],
    references: [users.id],
    relationName: "assignee",
  }),
  labelToIssues: many(labelToIssues),
  comments: many(comments),
  reactions: many(reactions),
  revisions: many(issueRevisions),
  subcriptions: many(issueUserSubscriptions, {
    relationName: "issue",
  }),
  changeTitleActivities: many(changeTitleActivities),
  toggleActivities: many(toggleActivities),
  mentionActivities: many(mentionActivities),
  assignActivities: many(assignActivities),
  editLabelsActivities: many(editLabelsActivities),
}));

export const issueRevisions = sqliteTable("issue_revisions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  created_at: integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  revised_by_id: integer("revised_by_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  issue_id: integer("issue_id")
    .references(() => issues.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const issueRevisionsRelations = relations(issueRevisions, ({ one }) => ({
  revised_by: one(users, {
    fields: [issueRevisions.revised_by_id],
    references: [users.id],
    relationName: "revised_by",
  }),
  issue: one(issues, {
    fields: [issueRevisions.issue_id],
    references: [issues.id],
    relationName: "issue",
  }),
}));

export const issueUserSubscriptions = sqliteTable("issue_user_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  issue_id: integer("issue_id")
    .references(() => issues.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const issueUserSubscriptionRelations = relations(
  issueUserSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [issueUserSubscriptions.user_id],
      references: [users.id],
      relationName: "user",
    }),
    issue: one(issues, {
      fields: [issueUserSubscriptions.issue_id],
      references: [issues.id],
      relationName: "issue",
    }),
  })
);

export type Issue = InferModel<typeof issues>;
export type IssueUserSubscription = InferModel<typeof issueUserSubscriptions>;
export type IssueRevision = InferModel<typeof issueRevisions>;
export type IssueStatus = keyof typeof IssueStatuses;
