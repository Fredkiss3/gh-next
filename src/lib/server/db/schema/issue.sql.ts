import {
  serial,
  varchar,
  timestamp,
  text,
  pgEnum,
  integer,
  boolean,
  index,
  unique
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user.sql";
import { labelToIssues } from "./label.sql";
import { comments } from "./comment.sql";
import { reactions } from "./reaction.sql";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { pgTable } from "./index.sql";
import { issueEvents } from "./event.sql";
import { repositories } from "./repository.sql";

export const IssueStatuses = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  NOT_PLANNED: "NOT_PLANNED"
} as const;

export const issueStatusEnum = pgEnum("issue_status", [
  "OPEN",
  "CLOSED",
  "NOT_PLANNED"
]);

export const issueLockReasonEnum = pgEnum("issue_lock_reason", [
  "OFF_TOPIC",
  "TOO_HEATED",
  "RESOLVED",
  "SPAM"
]);
export type IssueLockReason =
  (typeof issueLockReasonEnum)["enumValues"][number];

export const issues = pgTable(
  "issues",
  {
    id: serial("id").primaryKey(),
    number: integer("number").notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    body: text("body").default("").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
    status_updated_at: timestamp("status_updated_at").defaultNow().notNull(),
    status: issueStatusEnum("status").default(IssueStatuses.OPEN).notNull(),
    author_id: integer("author_id").references(() => users.id, {
      onDelete: "set null"
    }),
    author_username: varchar("author_username", { length: 255 }).notNull(),
    author_avatar_url: varchar("author_avatar_url", { length: 255 }).notNull(),
    is_locked: boolean("is_locked").default(false).notNull(),
    lock_reason: issueLockReasonEnum("lock_reason"),
    repository_id: integer("repository_id")
      .references(() => repositories.id, {
        onDelete: "cascade"
      })
      .notNull()
  },
  (table) => ({
    titleIdx: index("iss_title_idx").on(table.title),
    createdAtIdx: index("iss_created_idx").on(table.created_at),
    updatedAtIdx: index("iss_updated_idx").on(table.updated_at),
    statusIdx: index("iss_status_idx").on(table.status),
    repositoryFKIdx: index("iss_repo_fk_idx").on(table.repository_id),
    authorFKIdx: index("iss_author_fk_idx").on(table.author_id),
    authorUsernameIdx: index("iss_author_uname_idx").on(table.author_username),
    uniqNumberIdx: unique("iss_uniq_number_idx").on(
      table.repository_id,
      table.number
    )
  })
);

export const issuesRelations = relations(issues, ({ one, many }) => ({
  repository: one(repositories, {
    fields: [issues.repository_id],
    references: [repositories.id],
    relationName: "repository"
  }),
  author: one(users, {
    fields: [issues.author_id],
    references: [users.id],
    relationName: "author"
  }),
  assignees: many(issueToAssignees, {
    relationName: "assignees"
  }),
  labelToIssues: many(labelToIssues),
  comments: many(comments),
  reactions: many(reactions),
  revisions: many(issueRevisions),
  subcriptions: many(issueUserSubscriptions, {
    relationName: "issue"
  }),
  events: many(issueEvents, {
    relationName: "parent"
  })
}));

export const issueToAssignees = pgTable(
  "issues_to_assignees",
  {
    id: serial("id").primaryKey(),
    assignee_username: varchar("assignee_username", {
      length: 255
    }).notNull(),
    assignee_avatar_url: varchar("assignee_avatar_url", {
      length: 255
    }).notNull(),
    issue_id: integer("issue_id")
      .references(() => issues.id)
      .notNull(),
    assignee_id: integer("assignee_id").references(() => users.id, {
      onDelete: "cascade"
    })
  },
  (table) => ({
    issueFkIndex: index("is_2_ass_issue_fk_index").on(table.issue_id),
    assigneeFkIndex: index("is_2_ass_assignee_fk_index").on(table.assignee_id)
  })
);

export const issueToAssigneesRelation = relations(
  issueToAssignees,
  ({ one, many }) => ({
    issue: one(issues, {
      fields: [issueToAssignees.issue_id],
      references: [issues.id],
      relationName: "assignees"
    }),
    assignee: one(users, {
      fields: [issueToAssignees.assignee_id],
      references: [users.id],
      relationName: "assignee"
    })
  })
);

export const issueRevisions = pgTable("issue_revisions", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  revised_by_username: varchar("revised_by_username", {
    length: 255
  }).notNull(),
  revised_by_avatar_url: varchar("revised_by_avatar_url", {
    length: 255
  }).notNull(),
  issue_id: integer("issue_id")
    .references(() => issues.id, {
      onDelete: "cascade"
    })
    .notNull(),
  updated_description: text("updated_description").notNull()
});

export const issueRevisionsRelations = relations(issueRevisions, ({ one }) => ({
  issue: one(issues, {
    fields: [issueRevisions.issue_id],
    references: [issues.id],
    relationName: "issue"
  })
}));

export const issueUserSubscriptions = pgTable("issue_user_subscriptions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.id, {
      onDelete: "cascade"
    })
    .notNull(),
  issue_id: integer("issue_id")
    .references(() => issues.id, {
      onDelete: "cascade"
    })
    .notNull()
});

export const issueUserSubscriptionRelations = relations(
  issueUserSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [issueUserSubscriptions.user_id],
      references: [users.id],
      relationName: "user"
    }),
    issue: one(issues, {
      fields: [issueUserSubscriptions.issue_id],
      references: [issues.id],
      relationName: "issue"
    })
  })
);

export type Issue = InferSelectModel<typeof issues>;
export type IssueInsert = InferInsertModel<typeof issues>;

export type IssueUserSubscription = InferSelectModel<
  typeof issueUserSubscriptions
>;

export type IssueRevision = InferSelectModel<typeof issueRevisions>;
export type IssueRevisionInsert = InferInsertModel<typeof issueRevisions>;

export type IssueToAssigneeInsert = InferInsertModel<typeof issueToAssignees>;

export type IssueStatus = keyof typeof IssueStatuses;
