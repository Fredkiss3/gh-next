"use server";

import { revalidatePath } from "next/cache";
import { withAuth, type AuthError, type AuthState } from "./middlewares";
import { updateUserInfos } from "~/models/user";
import {
  updateUserProfileInfosInputValidator,
  type UpdateUserProfileInfosInput
} from "~/models/dto/update-profile-info-input-validator";

import type { FormState } from "~/lib/types";

export const updateUserProfile = withAuth(
  async (
    _previousState: FormState<UpdateUserProfileInfosInput> | AuthError,
    formData: FormData,
    { session, currentUser }: AuthState
  ): Promise<FormState<UpdateUserProfileInfosInput>> => {
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

    await updateUserInfos(result.data, currentUser.id);

    await session.addFlash({
      type: "success",
      message: "Profile updated successfully"
    });

    revalidatePath(`/`);
    return {
      type: "success" as const,
      message: "Success"
    };
  }
);
