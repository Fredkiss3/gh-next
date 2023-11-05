import "server-only";
import { revalidatePath } from "next/cache";
import { getSession, getAuthedUser } from "~/app/(actions)/auth";
import type {
  AuthState,
  AuthedServerActionResult,
  OmitFirstItemInArray,
  AuthError
} from "~/lib/types";

export function withAuth<
  T extends (auth: AuthState, ...args: any[]) => Promise<any>
>(action: T): AuthedServerActionResult<T> {
  return async (...args: OmitFirstItemInArray<Parameters<T>>) => {
    const session = await getSession();
    const currentUser = await getAuthedUser();

    if (!currentUser) {
      await session.addFlash({
        type: "warning",
        message: "You must be authenticated to do this action."
      });

      revalidatePath("/");
      return {
        type: "AUTH_ERROR" as const
      } satisfies AuthError;
    }

    const boundAction = action.bind(null, { currentUser, session });
    return boundAction(...args);
  };
}
