import "server-only";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";
import { getAuthedUser, getSession } from "~/app/(actions)/auth";
import type { AuthedServerActionResult } from "../types";

export function withAuth<T extends (...args: any[]) => Promise<any>>(
  action: T
): AuthedServerActionResult<T> {
  return async (...args: Parameters<T>) => {
    const user = await getAuthedUser();

    if (!user) {
      const session = await getSession();
      await session.addFlash({
        type: "warning",
        message: "You must be authenticated to do this action."
      });

      revalidatePath("/");
      return {
        type: "AUTH_ERROR" as const
      } satisfies Awaited<ReturnType<AuthedServerActionResult<T>>>;
    }
    return action(...args);
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
