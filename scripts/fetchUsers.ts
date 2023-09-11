import { users } from "~/lib/server/db/schema/user.sql";
import { fetchFromGithubAPI } from "~/lib/server/utils.server";
import { env } from "~/env.mjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const db = drizzle(postgres(env.DATABASE_URL));

const dbUsers = await db.select().from(users);

for (const user of dbUsers) {
  const userFromGithub = await fetchFromGithubAPI<{
    user: {
      name: string;
      bio: string;
      location: string;
      company: string;
    };
  }>(
    /* GraphQL */ `
      query ($login: String!) {
        user(login: $login) {
          name
          bio
          location
          company
        }
      }
    `,
    {
      login: user.username
    }
  ).catch((error) => null);

  if (userFromGithub) {
    await db.update(users).set(userFromGithub.user);
    console.log(`updated user [${user.username}] with infos : `);
    console.dir(userFromGithub.user, { depth: null });
  }
}

process.exit();
