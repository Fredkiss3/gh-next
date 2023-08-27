import { serial, text, pgTableCreator } from "drizzle-orm/pg-core";

export const pgTable = pgTableCreator((name) => `gh_next_${name}`);
