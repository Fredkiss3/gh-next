import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import type { InferModel } from "drizzle-orm";

export const userTable = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey(),
    username: text("username").notNull(),
    github_id: text("github_id").notNull(),
  },
  (users) => ({
    usernameIdx: uniqueIndex("usernameIdx").on(users.username),
    ghIdIdx: uniqueIndex("ghIdIdx").on(users.github_id),
  })
);

export type User = InferModel<typeof userTable>;
