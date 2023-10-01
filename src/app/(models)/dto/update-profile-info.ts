import { z } from "zod";

export const updateUserProfileInfosInputValidator = z.object({
  name: z.string().trim().nullish(),
  bio: z.string().trim().nullish(),
  location: z.string().trim().nullish(),
  company: z.string().trim().nullish()
});

export type UpdateUserProfileInfosInput = z.TypeOf<
  typeof updateUserProfileInfosInputValidator
>;
