import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

import { relations, sql } from "drizzle-orm";
import { users } from "./user";
import { labels } from "./label";
import { issues } from "./issue";

import type { InferModel } from "drizzle-orm";

const baseActivityFields = {
  id: integer("id").primaryKey({ autoIncrement: true }),
  created_at: integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  initiator_id: integer("initiator_id").references(() => users.id, {
    onDelete: "set null",
  }),
  issue_id: integer("issue_id")
    .references(() => issues.id, {
      onDelete: "cascade",
    })
    .notNull(),
};

export const changeTitleActivities = sqliteTable("change_title_activities", {
  ...baseActivityFields,
  old_title: text("old_title", { length: 255 }).notNull(),
  new_title: text("new_title", { length: 255 }).notNull(),
});

export const changeTitleActivitiesRelations = relations(
  changeTitleActivities,
  ({ one }) => ({
    initiator: one(users, {
      fields: [changeTitleActivities.initiator_id],
      references: [users.id],
      relationName: "initiator",
    }),
    issue: one(issues, {
      fields: [changeTitleActivities.issue_id],
      references: [issues.id],
      relationName: "issue",
    }),
  })
);

// this is repeated but not included in the database migration because it is not exported,
// the original enum is defined in `issue.ts` file
// const issueStatusEnum = pgEnum("issue_status", [
//   "OPEN",
//   "CLOSED",
//   "NOT_PLANNED",
// ]);

export const toggleActivities = sqliteTable("issue_toggle_activities", {
  ...baseActivityFields,
  status: text("status", { enum: ["OPEN", "CLOSED", "NOT_PLANNED"] }).notNull(),
});

export const issueToggleActivitiesRelations = relations(
  toggleActivities,
  ({ one }) => ({
    initiator: one(users, {
      fields: [toggleActivities.initiator_id],
      references: [users.id],
      relationName: "initiator",
    }),
    issue: one(issues, {
      fields: [toggleActivities.issue_id],
      references: [issues.id],
      relationName: "issue",
    }),
  })
);

export const mentionActivities = sqliteTable("issue_mention_activities", {
  ...baseActivityFields,
  mentionned_issue_id: integer("mentionned_issue_id")
    .references(() => issues.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const issueMentionActivitiesRelations = relations(
  mentionActivities,
  ({ one }) => ({
    initiator: one(users, {
      fields: [mentionActivities.initiator_id],
      references: [users.id],
      relationName: "initiator",
    }),
    issue: one(issues, {
      fields: [mentionActivities.issue_id],
      references: [issues.id],
      relationName: "parentIssue",
    }),
    mentionnedIssue: one(issues, {
      fields: [mentionActivities.issue_id],
      references: [issues.id],
      relationName: "mentionnedIssue",
    }),
  })
);

export const assignActivities = sqliteTable("assign_activities", {
  ...baseActivityFields,
  assignee_id: integer("assignee_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const assignActivitiesRelations = relations(
  assignActivities,
  ({ one }) => ({
    initiator: one(users, {
      fields: [assignActivities.initiator_id],
      references: [users.id],
      relationName: "initiator",
    }),
    issue: one(issues, {
      fields: [assignActivities.issue_id],
      references: [issues.id],
      relationName: "issue",
    }),
    assignee: one(users, {
      fields: [assignActivities.issue_id],
      references: [users.id],
      relationName: "assignee",
    }),
  })
);

export const editLabelsActivities = sqliteTable("edit_labels_activities", {
  ...baseActivityFields,
});

export const editLabelsActivitiesRelations = relations(
  editLabelsActivities,
  ({ one, many }) => ({
    initiator: one(users, {
      fields: [editLabelsActivities.initiator_id],
      references: [users.id],
      relationName: "initiator",
    }),
    issue: one(issues, {
      fields: [editLabelsActivities.issue_id],
      references: [issues.id],
      relationName: "issue",
    }),
    labels: many(editActiviyToLabels, {
      relationName: "labels",
    }),
  })
);

export const editActiviyToLabels = sqliteTable(
  "edit_activity_to_labels",
  {
    activity_id: integer("activity_id")
      .notNull()
      .references(() => editLabelsActivities.id, {
        onDelete: "cascade",
      }),
    label_id: integer("label_id")
      .notNull()
      .references(() => labels.id, {
        onDelete: "cascade",
      }),
    action: text("action", {
      enum: ["REMOVED", "ADDED"],
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey(table.activity_id, table.label_id),
  })
);

export const editActiviyToLabelsRelations = relations(
  editActiviyToLabels,
  ({ one }) => ({
    activity: one(editLabelsActivities, {
      fields: [editActiviyToLabels.activity_id],
      references: [editLabelsActivities.id],
      relationName: "labels",
    }),
    label: one(labels, {
      fields: [editActiviyToLabels.label_id],
      references: [labels.id],
    }),
  })
);

export type ChangeTitleActivity = InferModel<typeof changeTitleActivities>;
export type IssueToggleActivity = InferModel<typeof toggleActivities>;
export type IssueMentionActivity = InferModel<typeof mentionActivities>;
export type AssignActivity = InferModel<typeof assignActivities>;
export type EditLabelsActivity = InferModel<typeof editLabelsActivities>;
