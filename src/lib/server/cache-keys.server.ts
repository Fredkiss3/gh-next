import "server-only";

export const CacheKeys = {
  github: () => ["GITHUB_REPO_DATA"],
  labelCount: () => ["LABEL_COUNT"],
  openIssuesCount: () => ["OPEN_ISSUES_COUNT"]
} as const;
