import "server-only";
import { eq, sql } from "drizzle-orm";
import { CacheKeys } from "~/lib/server/cache-keys.server";
import { db } from "~/lib/server/db/index.server";
import { issues } from "~/lib/server/db/schema/issue.sql";
import { nextCache } from "~/lib/server/rsc-utils.server";

export async function getOpenIssuesCount() {
  const fn = nextCache(
    async () => {
      const [count] = await db
        .select({
          count: sql<number>`count(*)`.mapWith(Number)
        })
        .from(issues)
        .where(eq(issues.status, "OPEN"));
      return count.count;
    },
    {
      tags: CacheKeys.openIssuesCount()
    }
  );

  return fn();
}
