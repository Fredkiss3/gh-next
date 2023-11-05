import "server-only";
import { revalidatePath } from "next/cache";
import { getSession, getAuthedUser } from "~/app/(actions)/auth";
import type { OmitFirstItemInArray } from "~/lib/types";
import type { Session } from "~/lib/server/session.server";
import type { User } from "~/lib/server/db/schema/user.sql";

export type AuthState = {
  currentUser: User;
  session: Session;
};

export type AuthError = {
  type: "AUTH_ERROR";
};

export type AuthedServerActionResult<
  Action extends (auth: AuthState, ...args: any[]) => Promise<any>
> = (
  ...args: OmitFirstItemInArray<Parameters<Action>>
) => Promise<Awaited<ReturnType<Action>> | AuthError>;

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
