import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "~/app/(actions)/auth";
import { setFlash } from "~/app/(actions)/flash";

export function isSSR() {
  return headers().get("accept")?.includes("text/html");
}

export function withAuth<T extends (...args: any[]) => Promise<any>>(
  action: T
): T {
  return (async (...args: Parameters<T>) => {
    const user = await getUser();

    if (!user) {
      setFlash({
        type: "error",
        message: "You must be authenticated to do this action",
      });

      // FIXME: this is a workaround until this PR is merged : https://github.com/vercel/next.js/pull/49439
      if (isSSR()) {
        redirect("/");
      } else {
        return {
          error: "Unauthenticated",
        };
      }
    }

    return action(...args);
  }) as T;
}
