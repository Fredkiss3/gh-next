import { users } from "~/lib/server/db/schema/user.sql";
import { fetchFromGithubAPI } from "~/lib/server/utils.server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";

const db = drizzle(postgres(process.env.DATABASE_URL!));

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
    await db
      .update(users)
      .set(userFromGithub.user)
      .where(eq(users.username, user.username));
    console.log(`updated user [${user.username}] with infos : `);
    console.dir(userFromGithub.user, { depth: null });
  }
}

process.exit();
