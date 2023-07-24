import {
  pgTable,
  serial,
  varchar,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

import { relations, type InferModel } from "drizzle-orm";
import { issues } from "./issue";

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).default("").notNull(),
  color: varchar("color", { length: 10 }).notNull(), // 10 chars for a generous length
});

export const labelToIssues = pgTable(
  "labels_to_issues",
  {
    issue_id: integer("issue_id")
      .notNull()
      .references(() => issues.id),
    label_id: integer("label_id")
      .notNull()
      .references(() => labels.id),
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
