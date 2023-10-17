import { customType, pgTableCreator } from "drizzle-orm/pg-core";

export const pgTable = pgTableCreator((name) => `gh_next_${name}`);

export const tsVector = customType<{
  data: string;
  config: { generated: string };
}>({
  dataType(config) {
    return (
      `tsvector` +
      (config
        ? ` generated always as (${config.generated}) stored`
        : ""
      ).toString()
    );
  }
});
