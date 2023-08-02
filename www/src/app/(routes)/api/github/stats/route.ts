import { NextResponse } from "next/server";
import {
  GITHUB_AUTHOR_USERNAME,
  GITHUB_REPOSITORY_NAME,
} from "~/lib/constants";
import { fetchFromGithubAPI } from "~/lib/server-utils";
import type { GithubRepositoryData } from "~/lib/types";

export async function GET() {
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
      ((edge.size / repository.languages.totalSize) * 100).toFixed(1)
    );

    totalPercent += percent;

    if (totalPercent > 100) {
      percent -= totalPercent - 100; // remove the rest so that the sum of all percents is 100%
      percent = Number(percent.toFixed(2));
    }

    return {
      ...edge.node,
      percent,
    };
  });

  const data = {
    languages,
    forkCount: repository.forkCount,
    url: repository.url,
    description: repository.description,
    stargazerCount: repository.stargazerCount,
    watcherCount: repository.watchers.totalCount,
    stargazers: allStargazers,
    readmeContent: await fetch(
      `https://raw.githubusercontent.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/main/README.md`,
      {
        cache: "no-store",
      }
    ).then((r) => r.text()),
  } satisfies GithubRepositoryData;

  return NextResponse.json(data);
}