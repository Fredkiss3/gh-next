import { serial, varchar, integer, primaryKey } from "drizzle-orm/pg-core";

import { relations, type InferModel } from "drizzle-orm";
import { issues } from "./issue.sql";
import { pgTable } from "./index.sql";

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).default("").notNull(),
  // 10 chars for a generous length, in practice it is 7 chars at most
  // ex: #FF10C0
  color: varchar("color", { length: 10 }).notNull()
});

export const labelToIssues = pgTable(
  "labels_to_issues",
  {
    issue_id: integer("issue_id")
      .notNull()
      .references(() => issues.id, {
        onDelete: "cascade"
      }),
    label_id: integer("label_id")
      .notNull()
      .references(() => labels.id, {
        onDelete: "cascade"
      })
  },
  (table) => ({
    pk: primaryKey(table.issue_id, table.label_id)
  })
);

export const labelToIssuesRelations = relations(labelToIssues, ({ one }) => ({
  issue: one(issues, {
    fields: [labelToIssues.issue_id],
    references: [issues.id]
  }),
  label: one(labels, {
    fields: [labelToIssues.label_id],
    references: [labels.id]
  })
}));

export const labelRelations = relations(labels, ({ many }) => ({
  labelToIssues: many(labelToIssues)
}));

export type Label = InferModel<typeof labels>;
