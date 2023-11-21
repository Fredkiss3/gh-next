import "server-only";
import { eq, sql, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/server/db/index.server";
import { users } from "~/lib/server/db/schema/user.sql";
import type { Theme } from "~/lib/server/db/schema/user.sql";
import type { UpdateUserProfileInfosInput } from "./dto/update-profile-info-input-validator";
import { publicUserOutputValidator } from "~/app/(models)/dto/public-user-output-validator";

/**
 * Find or create the corresponding user in DB from their github profile
 * @param ghUser
 * @returns
 */
export async function getOrInsertUserFromGithubProfile(
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
      bio: ghUser.bio
    })
    .onConflictDoUpdate({
      target: users.github_id,
      set: {
        avatar_url: ghUser.avatar_url
      }
    })
    .returning();
}

const userByIdPrepared = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder("id")))
  .prepare("user_by_id");

export async function getUserById(id: number) {
  const [dbUser] = await userByIdPrepared.execute({
    id
  });
  return dbUser ?? null;
}
const userByUsernamePrepared = db
  .select()
  .from(users)
  .where(eq(users.username, sql.placeholder("username")))
  .prepare("user_by_username");

export async function getUserByUsername(username: string) {
  const [dbUser] = await userByUsernamePrepared.execute({
    username
  });

  const outputSchema = z.union([publicUserOutputValidator, z.null()]);
  return outputSchema.parse(dbUser ?? null);
}

export async function getMultipleUserByUsername(usernames: string[]) {
  if (usernames.length === 0) return [];
  return await db
    .select({
      name: users.name,
      username: users.username,
      bio: users.bio,
      location: users.location,
      avatar_url: users.avatar_url,
      id: users.id
    })
    .from(users)
    .where(sql`${users.username} in ${usernames}`);
}

export type UserQueryResult = Awaited<
  ReturnType<typeof getMultipleUserByUsername>
>[number];

export async function updateUserInfos(
  data: UpdateUserProfileInfosInput,
  id: number
) {
  return await db.update(users).set(data).where(eq(users.id, id));
}

export async function updateUserTheme(newTheme: Theme, id: number) {
  return await db
    .update(users)
    .set({
      preferred_theme: newTheme
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
  bio: z.string().nullish()
});
