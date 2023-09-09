import "server-only";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";
import { headers } from "next/headers";
import { getAuthedUser, getSession } from "~/app/(actions)/auth";

export function withAuth<T extends (...args: any[]) => Promise<any>>(
  action: T
): T {
  return (async (...args: Parameters<T>) => {
    const user = await getAuthedUser();

    if (!user) {
      const session = await getSession();
      await session.addFlash({
        type: "warning",
        message: "You must be authenticated to do this action."
      });

      revalidatePath("/");
      return;
    }
    return action(...args);
  }) as T;
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

export function isSSR() {
  return headers().get("accept")?.includes("text/html");
}
