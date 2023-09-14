import { asc, sql } from "drizzle-orm";
import "server-only";
import { db } from "~/lib/server/db/index.server";
import { labels } from "~/lib/server/db/schema/label.sql";

const labelsByNamePrepared = db
  .select()
  .from(labels)
  .where(sql`lower(${labels.name}) ILIKE ${sql.placeholder("name")}`)
  .orderBy(asc(labels.name))
  .prepare("label_by_name");

export async function getLabelsName(name: string) {
  return await labelsByNamePrepared.execute({
    name: name + "%"
  });
}
