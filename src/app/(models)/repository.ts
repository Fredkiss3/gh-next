import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "~/lib/server/db/index.server";
import { repositories } from "~/lib/server/db/schema/repository.sql";
import { users } from "~/lib/server/db/schema/user.sql";
import { z } from "zod";
import { repositoryOutputValidator } from "~/app/(models)/dto/repository-output-validator";
import { cache } from "react";

const repositoryByNamePrepared = db
  .select({
    id: repositories.id,
    name: repositories.name,
    description: repositories.description,
    is_public: repositories.is_public,
    owner: {
      id: users.id,
      username: users.username,
      name: users.name,
      avatar_url: users.avatar_url,
      bio: users.bio,
      location: users.location
    }
  })
  .from(repositories)
  .innerJoin(
    users,
    and(
      eq(repositories.creator_id, users.id),
      eq(users.username, sql.placeholder("owner_username"))
    )
  )
  .where(
    and(
      eq(repositories.name, sql.placeholder("repository_name")),
      eq(repositories.is_public, true) // TODO : remove this condition when visibility is correctly implemented
    )
  )
  .prepare("repositories_by_name_and_owner");

export const getRepositoryByOwnerAndName = cache(
  async function getRepositoryByOwnerAndName(
    owner_username: string,
    repository_name: string
  ) {
    const [repository] = await repositoryByNamePrepared.execute({
      repository_name,
      owner_username
    });

    const outputSchema = z.union([repositoryOutputValidator, z.null()]);

    return outputSchema.parse(repository ?? null);
  }
);
