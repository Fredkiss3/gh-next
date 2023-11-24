import "server-only";
import { z } from "zod";
import { publicUserOutputValidator } from "~/app/(models)/dto/public-user-output-validator";

export const repositoryOutputValidator = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  is_public: z.boolean(),
  owner: publicUserOutputValidator
});

export type RepositoryOutput = z.TypeOf<typeof repositoryOutputValidator>;
