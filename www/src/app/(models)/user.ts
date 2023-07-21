import { z } from "zod";
import { db } from "../../lib/db";
import { users } from "../../lib/db/schema/user";

export async function getUserFromGithubProfile(
  ghUser: z.TypeOf<typeof githubUserSchema>
) {
  return await db
    .insert(users)
    .values({
      id: ghUser.id,
      github_id: ghUser.id.toString(),
      username: ghUser.login,
      avatar_url: ghUser.avatar_url,
    })
    .onConflictDoUpdate({
      target: users.github_id,
      set: {
        avatar_url: ghUser.avatar_url,
      },
    })
    .returning()
    .get();
}

export const githubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  avatar_url: z.string(),
});
