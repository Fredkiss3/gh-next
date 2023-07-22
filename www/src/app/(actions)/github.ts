"use server";

import { kv } from "~/lib/kv";
import { fetchFromGithubAPI } from "~/lib/server-utils";
import {
  GITHUB_AUTHOR_USERNAME,
  GITHUB_REPOSITORY_CACHE_KEY,
  GITHUB_REPOSITORY_NAME,
} from "~/lib/constants";
import { cache } from "react";

type GithubRepositoryData = {
  forkCount: number;
  stargazerCount: number;
  watcherCount: number;
  stargazers: string[]; // array of logins
  readmeContent: string;
  description: string;
  url: string;
  languages: Array<{
    name: string;
    color: string;
    percent: number;
  }>;
};

/**
 * TODO : GET LANGUAGE INFOS : 
 * 
 *  languages(first: 100) {
      totalSize # (totalSize for all languages)
      totalCount
      edges {
        size # Size for one language, divide by the total to get the percent
        node {
          name
          color # In Hexa
        }
      }
    }
 * 
 */

/**
 * get the statistics of the repo,
 * this data is refetched at most every 30 minutes
 * @returns
 */
export const getGithubRepoData = cache(async function getGithubRepoData() {
  // await kv.delete(GITHUB_REPOSITORY_CACHE_KEY);
  let data = await kv.get<GithubRepositoryData>(GITHUB_REPOSITORY_CACHE_KEY);

  if (!data) {
    const repostatsQuery = /* GraphQL */ `
      query ($repoName: String!, $repoOwner: String!) {
        repository(name: $repoName, owner: $repoOwner) {
          description
          forkCount
          url
          stargazerCount
          watchers(first: 1) {
            totalCount
          }
          languages(first: 100, orderBy: { field: SIZE, direction: DESC }) {
            totalSize
            totalCount
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    `;
    const stargazersQuery = /* GraphQL */ `
      query ($cursor: String, $repoName: String!, $repoOwner: String!) {
        repository(name: $repoName, owner: $repoOwner) {
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
        url: string;
        forkCount: number;
        description: string;
        stargazerCount: number;
        watchers: { totalCount: number };
        languages: {
          totalSize: number;
          totalCount: number;
          edges: Array<{
            size: number;
            node: {
              name: string;
              color: string;
            };
          }>;
        };
      };
    }>(repostatsQuery, {
      repoName: GITHUB_REPOSITORY_NAME,
      repoOwner: GITHUB_AUTHOR_USERNAME,
    });

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
      repoName: GITHUB_REPOSITORY_NAME,
      repoOwner: GITHUB_AUTHOR_USERNAME,
    });

    let allStargazers: GithubRepositoryData["stargazers"] =
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
        repoName: GITHUB_REPOSITORY_NAME,
        repoOwner: GITHUB_AUTHOR_USERNAME,
      });

      nextCursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
      allStargazers = allStargazers.concat(edges.map(({ node }) => node.login));
    }

    let totalPercent = 0;
    const languages = repository.languages.edges.map((edge) => {
      let percent = Number(
        ((edge.size / repository.languages.totalSize) * 100).toFixed(2)
      );

      totalPercent += percent;

      if (totalPercent > 100) {
        percent -= totalPercent - 100; // remove the rest so that the sum of all percents is 100%
      }

      return {
        ...edge.node,
        percent,
      };
    });

    data = {
      languages,
      forkCount: repository.forkCount,
      url: repository.url,
      description: repository.description,
      stargazerCount: repository.stargazerCount,
      watcherCount: repository.watchers.totalCount,
      stargazers: allStargazers,
      readmeContent: await fetch(
        `https://raw.githubusercontent.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/main/README.md`
      ).then((r) => r.text()),
    };

    const THIRTY_MINUTES_IN_SECONDS = 30 * 60;
    await kv.set<GithubRepositoryData>(
      GITHUB_REPOSITORY_CACHE_KEY,
      data,
      THIRTY_MINUTES_IN_SECONDS
    );
  }

  return data;
});
