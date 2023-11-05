import "server-only";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";
import { getAuthedUser, getSession } from "~/app/(actions)/auth";
import type {
  AuthError,
  AuthState,
  AuthedServerActionResult,
  OmitFirstItemInArray
} from "../types";

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

type Callback = (...args: any[]) => Promise<any>;
export function nextCache<T extends Callback>(
  cb: T,
  options: {
    tags: string[];
    revalidate?: number;
  }
) {
  return cache(unstable_cache(cb, options.tags, options));
}
