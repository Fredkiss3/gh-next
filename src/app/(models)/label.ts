import "server-only";
import { asc, sql } from "drizzle-orm";
import { CacheKeys } from "~/lib/server/cache-keys.server";
import { db } from "~/lib/server/db/index.server";
import { labels } from "~/lib/server/db/schema/label.sql";
import { nextCache } from "~/lib/server/rsc-utils.server";

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

export async function getLabelsCount() {
  const fn = nextCache(
    async () => {
      const [count] = await db
        .select({
          count: sql<number>`count(*)`.mapWith(Number)
        })
        .from(labels);

      return count.count;
    },
    {
      tags: CacheKeys.labelCount()
    }
  );

  return fn();
}
