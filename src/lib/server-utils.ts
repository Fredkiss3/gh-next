import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "~/app/(actions)/auth";

export function isSSR() {
  return headers().get("accept")?.includes("text/html");
}
export function ssrRedirect(path: string) {
  // FIXME: this condition is a workaround until this PR is merged : https://github.com/vercel/next.js/issues/49424
  if (isSSR()) {
    return redirect(path);
  }
}

export function withAuth<T extends (...args: any[]) => Promise<any>>(
  action: T
): T {
  return (async (...args: Parameters<T>) => {
    const session = await getSession();

    if (!session.user) {
      await session.addFlash({
        type: "warning",
        message: "You must be authenticated to do this action.",
      });

      await forceRevalidate();
      return;
    }
    return action(...args);
  }) as T;
}

/**
 * Force revalidate, we use this instead of `revalidatePath`
 * because it does not work within cloudfare workers
 */
export async function forceRevalidate() {
  "use server";
  cookies().delete("dummy");
}
