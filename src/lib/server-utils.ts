import { cookies, headers } from "next/headers";
import { getSession } from "~/app/(actions)/auth";

export function isSSR() {
  return headers().get("accept")?.includes("text/html");
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

      // force revalidate
      cookies().delete("dummy");
      return;
    }
    return action(...args);
  }) as T;
}
