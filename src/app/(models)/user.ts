import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/server/db/index.server";
import { users } from "~/lib/server/db/schema/user.sql";
import type { Theme } from "~/lib/server/db/schema/user.sql";

/**
 * Find or create the corresponding user in DB from their github profile
 * @param ghUser
 * @returns
 */
export async function getUserFromGithubProfile(
  ghUser: z.TypeOf<typeof githubUserSchema>
) {
  return await db
    .insert(users)
    .values({
      github_id: ghUser.id.toString(),
      username: ghUser.login,
      avatar_url: ghUser.avatar_url,
      name: ghUser.name,
      location: ghUser.location,
      bio: ghUser.bio,
    })
    .onConflictDoUpdate({
      target: users.github_id,
      set: {
        avatar_url: ghUser.avatar_url,
        name: ghUser.name,
        location: ghUser.location,
        bio: ghUser.bio,
      },
    })
    .returning();
}

const userByUserNamePrepared = db
  .select({
    username: users.username,
  })
  .from(users)
  .where(
    sql`lower(${users.username}) = ${sql.placeholder("username_lowercase")}`
  )
  .prepare("user_by_username");

/**
 * get user by username, this function is case insensitive
 * @param username
 * @returns
 */
export async function getUserByUsername(username: string) {
  return await userByUserNamePrepared.execute({
    username_lowercase: username.toLowerCase(),
  });
}

const userByIdPrepared = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder("id")))
  .prepare("user_by_id");

export async function getUserById(id: number) {
  return await userByIdPrepared.execute({
    id,
  });
}

export async function updateUserUsername(username: string, id: number) {
  return await db
    .update(users)
    .set({
      username,
    })
    .where(eq(users.id, id))
    .returning();
}

export async function updateUserTheme(newTheme: Theme, id: number) {
  return await db
    .update(users)
    .set({
      preferred_theme: newTheme,
    })
    .where(eq(users.id, id))
    .returning();
}

export const githubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  name: z.string(),
  avatar_url: z.string(),
  location: z.string().nullish(),
  bio: z.string().nullish(),
});
