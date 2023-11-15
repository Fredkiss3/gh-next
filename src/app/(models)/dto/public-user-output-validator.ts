import "server-only";
import { z } from "zod";

export const publicUserOutputValidator = z.object({
  id: z.number().nullable(),
  username: z.string(),
  avatar_url: z.string(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  name: z.string().nullable()
});

export type PublicUser = z.TypeOf<typeof publicUserOutputValidator>;
