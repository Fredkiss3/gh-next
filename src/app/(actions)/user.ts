"use server";

import { revalidatePath } from "next/cache";
import { withAuth } from "~/lib/server/rsc-utils.server";
import { updateUserInfos } from "~/app/(models)/user";
import { getSession, getAuthedUser } from "./auth";
import { updateUserProfileInfosInputValidator } from "~/app/(models)/dto/update-profile-info-input-validator";

import type { AuthError, ServerActionResult } from "~/lib/types";

export const updateUserProfile = withAuth(async function (
  _: ServerActionResult | AuthError,
  formData: FormData
) {
  const session = await getSession();
  const currentUser = (await getAuthedUser())!;
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
    } satisfies ServerActionResult;
  }

  await updateUserInfos(result.data, currentUser!.id);

  await session.addFlash({
    type: "success",
    message: "Profile updated successfully"
  });

  revalidatePath(`/`);
  return {
    type: "success" as const,
    message: "Success"
  } satisfies ServerActionResult;
});
