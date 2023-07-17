"use server";

import { kv } from "~/lib/kv";
import { fetchFromGithubAPI } from "~/lib/server-utils";
import { GITHUB_REPOSITORY_CACHE_KEY } from "~/lib/constants";

type GithubRepositoryStats = {
  forkCount: number;
  stargazerCount: number;
  watcherCount: number;
  stargazers: string[]; // array of logins
};

/**
 * get the statistics of the repo,
 * this data is refetched at most every 30 minutes
 * @returns
 */
export async function getGithubRepoStats() {
  let data = await kv.get<GithubRepositoryStats>(GITHUB_REPOSITORY_CACHE_KEY);

  if (!data) {
    const repostatsQuery = /* GraphQL */ `
      query {
        repository(name: "gh-next", owner: "Fredkiss3") {
          forkCount
          stargazerCount
          watchers(first: 1) {
            totalCount
          }
        }
      }
    `;
    const stargazersQuery = /* GraphQL */ `
      query ($cursor: String) {
        repository(name: "gh-next", owner: "Fredkiss3") {
          stargazers(after: $cursor, first: 100) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                login
              }
            }
          }
        }
      }
    `;

    const { repository } = await fetchFromGithubAPI<{
      repository: {
        forkCount: number;
        stargazerCount: number;
        watchers: { totalCount: number };
      };
    }>(repostatsQuery);

    const {
      repository: { stargazers: allStargazersData },
    } = await fetchFromGithubAPI<{
      repository: {
        stargazers: {
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
          };
          edges: Array<{
            node: {
              login: string;
            };
          }>;
        };
      };
    }>(stargazersQuery, {
      first: 100,
    });

    let allStargazers: GithubRepositoryStats["stargazers"] =
      allStargazersData.edges.map(({ node }) => node.login);
    let nextCursor = allStargazersData.pageInfo.endCursor;
    let hasNextPage = allStargazersData.pageInfo.hasNextPage;

    while (hasNextPage) {
      const {
        repository: {
          stargazers: { pageInfo, edges },
        },
      } = await fetchFromGithubAPI<{
        repository: {
          stargazers: {
            pageInfo: {
              hasNextPage: boolean;
              endCursor: string;
            };
            edges: Array<{
              node: {
                login: string;
              };
            }>;
          };
        };
      }>(stargazersQuery, {
        cursor: nextCursor,
      });

      nextCursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
      allStargazers = allStargazers.concat(edges.map(({ node }) => node.login));
    }

    data = {
      forkCount: repository.forkCount,
      stargazerCount: repository.stargazerCount,
      watcherCount: repository.watchers.totalCount,
      stargazers: allStargazers,
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
