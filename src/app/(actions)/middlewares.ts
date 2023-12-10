import "server-only";
import { revalidatePath } from "next/cache";
import { getSession, getAuthedUser } from "~/app/(actions)/auth.action";
import type { FunctionWithoutLastArg, OmitLastItemInArray } from "~/lib/types";
import type { Session } from "~/lib/server/session.server";
import type { User } from "~/lib/server/db/schema/user.sql";

export type AuthState = {
  currentUser: User;
  session: Session;
};

export type AuthError = {
  type: "AUTH_ERROR";
};

export type AuthedServerAction<
  Action extends (...args: [...any[], auth: AuthState]) => Promise<any>
> = (
  ...args: Parameters<FunctionWithoutLastArg<Action>>
) => Promise<Awaited<ReturnType<Action>> | AuthError>;

export function withAuth<Action extends (...args: any[]) => Promise<any>>(
  action: Action
) {
  return (async (...args: Parameters<FunctionWithoutLastArg<Action>>) => {
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

    return action(...args, { currentUser, session });
  }) as AuthedServerAction<Action>;
}
