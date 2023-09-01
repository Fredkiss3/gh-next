import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession, getAuthedUser } from "~/app/(actions)/auth";
import { env } from "~/env.mjs";
import { GITHUB_AUTHOR_USERNAME } from "~/lib/shared/constants";
import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";

export function isSSR() {
  return headers().get("accept")?.includes("text/html");
}

export function ssrRedirect(path: string): void {
  // FIXME: this condition is a workaround until this issue is fixed ? : https://github.com/vercel/next.js/issues/49424
  if (isSSR()) {
    return redirect(path);
  }
}

export function withAuth<T extends (...args: any[]) => Promise<any>>(
  action: T
): T {
  return (async (...args: Parameters<T>) => {
    const user = await getAuthedUser();

    if (!user) {
      const session = await getSession();
      await session.addFlash({
        type: "warning",
        message: "You must be authenticated to do this action.",
      });

      revalidatePath("/");
      return;
    }
    return action(...args);
  }) as T;
}

const githubGraphQLAPIResponseSchema = z.union([
  z.object({
    message: z.string(),
    documentation_url: z.string().url(),
  }),
  z.object({
    message: z.undefined(),
    data: z.record(z.string(), z.any()),
  }),
  z.object({
    data: z.undefined(),
    message: z.undefined(),
    errors: z.array(z.record(z.string(), z.any())),
  }),
]);

/**
 * @param graphqlQuery
 * @param variables
 *
 * To explore and see the available graphQL queries, see : https://docs.github.com/fr/graphql/overview/explorer
 * @returns
 */
export async function fetchFromGithubAPI<T extends Record<string, any>>(
  graphqlQuery: string,
  variables: Record<string, any> = {}
) {
  return fetch(`https://api.github.com/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: graphqlQuery,
      variables,
    }),
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
      // this header is required per the documentation : https://docs.github.com/en/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#user-agent-required
      "User-Agent": GITHUB_AUTHOR_USERNAME,
    },
    // cache: "no-store",
  })
    .then((r) => r.json())
    .then((json) => {
      const parsed = githubGraphQLAPIResponseSchema.parse(json);

      if (parsed.message !== undefined) {
        if (parsed.message.toLowerCase() === "bad credentials") {
          throw new Error(
            "Invalid credentials, please update the credentials in the app settings"
          );
        } else {
          throw new Error(`Unknown error ${parsed.message}`);
        }
      } else if (parsed.data) {
        return parsed.data as T;
      } else {
        console.error({
          errors: parsed.errors,
        });
        throw new Error(`GraphQL error : check the terminal for errors.`);
      }
    });
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
