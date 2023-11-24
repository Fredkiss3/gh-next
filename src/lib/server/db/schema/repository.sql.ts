import {
  boolean,
  index,
  integer,
  serial,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";
import { relations, type InferSelectModel } from "drizzle-orm";
import { pgTable } from "./index.sql";
import { users } from "./user.sql";
import { issues } from "./issue.sql";

export const repositories = pgTable(
  "repositories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: text("description").notNull().default(""),
    created_at: timestamp("created_at").defaultNow().notNull(),
    creator_id: integer("creator_id").references(() => users.id, {
      onDelete: "cascade"
    }),
    is_archived: boolean("is_archived").default(false),
    is_public: boolean("is_public").default(true)
  },
  (table) => ({
    creatorFkIdx: index("repo_creator_fk_idx").on(table.creator_id)
  })
);

export const repositoryRelations = relations(repositories, ({ one, many }) => ({
  creator: one(users, {
    fields: [repositories.creator_id],
    references: [users.id],
    relationName: "creator"
  }),
  issues: many(issues, {
    relationName: "issues"
  })
}));

export type Repository = InferSelectModel<typeof repositories>;
