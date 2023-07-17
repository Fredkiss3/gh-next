"use server";

import { kv } from "~/lib/kv";
import { fetchFromGithubAPI } from "~/lib/server-utils";
import { GITHUB_REPOSITORY_CACHE_KEY } from "~/lib/constants";

type GithubRepositoryStats = {
  forkCount: number;
  stargazerCount: number;
  watcherCount: number;
};

export async function getGithubRepoStats() {
  let data = await kv.get<GithubRepositoryStats>(GITHUB_REPOSITORY_CACHE_KEY);

  if (!data) {
    const { repository } = await fetchFromGithubAPI<{
      repository: {
        forkCount: number;
        stargazerCount: number;
        watchers: { totalCount: number };
      };
    }>(/* GraphQL */ `
      query {
        repository(name: "gh-next", owner: "Fredkiss3") {
          forkCount
          stargazerCount
          watchers(first: 1) {
            totalCount
          }
        }
      }
    `);

    data = {
      forkCount: repository.forkCount,
      stargazerCount: repository.stargazerCount,
      watcherCount: repository.watchers.totalCount,
    };

    const THIRTY_MINUTES_IN_SECONDS = 30 * 60 * 60;
    await kv.set<GithubRepositoryStats>(
      GITHUB_REPOSITORY_CACHE_KEY,
      data,
      THIRTY_MINUTES_IN_SECONDS
    );
  }

  return data;
}
