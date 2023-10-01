import { z } from "zod";

export const updateUserProfileInfosInputValidator = z.object({
  name: z
    .string({
      required_error: "This field is required"
    })
    .trim()
    .nullable(),
  bio: z
    .string({
      required_error: "This field is required"
    })
    .trim()
    .nullable(),
  location: z
    .string({
      required_error: "This field is required"
    })
    .trim()
    .nullable(),
  company: z
    .string({
      required_error: "This field is required"
    })
    .trim()
    .nullable()
});

export type UpdateUserProfileInfosInput = z.TypeOf<
  typeof updateUserProfileInfosInputValidator
>;
