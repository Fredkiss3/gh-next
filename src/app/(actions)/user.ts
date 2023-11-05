"use server";

import { revalidatePath } from "next/cache";
import { withAuth } from "./middlewares";
import { updateUserInfos } from "~/app/(models)/user";
import {
  updateUserProfileInfosInputValidator,
  type UpdateUserProfileInfosInput
} from "~/app/(models)/dto/update-profile-info-input-validator";

import type { AuthError, AuthState, FormState } from "~/lib/types";

export const updateUserProfile = withAuth(async function (
  auth: AuthState,
  _: FormState<UpdateUserProfileInfosInput> | AuthError,
  formData: FormData
) {
  const result = updateUserProfileInfosInputValidator.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return {
      type: "error" as const,
      fieldErrors: result.error.flatten().fieldErrors,
      formData: {
        name: formData.get("name")?.toString() ?? null,
        bio: formData.get("bio")?.toString() ?? null,
        company: formData.get("company")?.toString() ?? null,
        location: formData.get("company")?.toString() ?? null
      }
    };
  }

  await updateUserInfos(result.data, auth.currentUser!.id);

  await auth.session.addFlash({
    type: "success",
    message: "Profile updated successfully"
  });

  revalidatePath(`/`);
  return {
    type: "success" as const,
    message: "Success"
  };
});
