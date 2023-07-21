import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

import { relations, type InferModel } from "drizzle-orm";
import { issues } from "./issue";

export const labels = sqliteTable("labels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  color: text("color").notNull(),
});

export const labelToIssues = sqliteTable(
  "labels_to_issues",
  {
    issue_id: integer("issue_id")
      .notNull()
      .references(() => issues.id, {
        onDelete: "restrict",
      }),
    label_id: integer("label_id")
      .notNull()
      .references(() => labels.id, {
        onDelete: "restrict",
      }),
  },
  (table) => ({
    pk: primaryKey(table.issue_id, table.label_id),
  })
);

export const labelToIssuesRelations = relations(labelToIssues, ({ one }) => ({
  issue: one(issues, {
    fields: [labelToIssues.issue_id],
    references: [issues.id],
  }),
  label: one(labels, {
    fields: [labelToIssues.label_id],
    references: [labels.id],
  }),
}));

export const labelRelations = relations(labels, ({ many }) => ({
  labelToIssues: many(labelToIssues),
}));

export type Label = InferModel<typeof labels>;
