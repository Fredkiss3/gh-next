import { eq, placeholder, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/db";
import { users } from "~/lib/db/schema/user";
import type { Theme } from "~/lib/db/schema/user";

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
    .returning()
    .get();
}

const userByUserNamePrepared = db
  .select({
    username: users.username,
  })
  .from(users)
  .where(sql`lower(${users.username}) = ${placeholder("username_lowercase")}`)
  .prepare();

/**
 * get user by username, this function is case insensitive
 * @param username
 * @returns
 */
export async function getUserByUsername(username: string) {
  return await userByUserNamePrepared.all({
    username_lowercase: username.toLowerCase(),
  });
}

const userByIdPrepared = db
  .select()
  .from(users)
  .where(eq(users.id, placeholder("id")))
  .prepare();

export async function getUserById(id: number) {
  return await userByIdPrepared.all({
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
    .returning()
    .get();
}

export async function updateUserTheme(newTheme: Theme, id: number) {
  return await db
    .update(users)
    .set({
      preferred_theme: newTheme,
    })
    .where(eq(users.id, id))
    .returning()
    .get();
}

export const githubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  name: z.string(),
  avatar_url: z.string(),
  location: z.string().nullish(),
  bio: z.string().nullish(),
});
