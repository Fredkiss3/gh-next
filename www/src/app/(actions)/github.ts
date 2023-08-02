"use server";

import { cache } from "react";
import { env } from "~/env.mjs";
import { jsonFetch } from "~/lib/shared-utils";
import type { GithubRepositoryData } from "~/lib/types";

/**
 * get the statistics of the repo,
 * this data is refetched at most every 30 minutes
 * @returns
 */
export const getGithubRepoData = cache(async function getGithubRepoData() {
  const THIRTY_MINUTES_IN_SECONDS = 30 * 60;
  return await jsonFetch<GithubRepositoryData>(
    `${env.NEXT_PUBLIC_VERCEL_URL}/api/github/stats`,
    {
      next: {
        revalidate: THIRTY_MINUTES_IN_SECONDS,
      },
    }
  );
});
