import { headers } from "next/headers";
import { getAuthenticatedUser } from "~/app/(actions)/auth";

export function isSSR() {
  return headers().get("accept")?.includes("text/html");
}

export function withAuth<T extends (...args: any[]) => Promise<any>>(
  action: T
): T {
  return (async (...args: Parameters<T>) => {
    await getAuthenticatedUser();
    return action(...args);
  }) as T;
}
