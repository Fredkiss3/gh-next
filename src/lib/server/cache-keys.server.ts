import "server-only";

export const CacheKeys = {
  github: () => ["GITHUB_REPO_DATA"],
  labelCount: () => ["LABEL_COUNT"],
  openIssuesCount: () => ["OPEN_ISSUES_COUNT"],
  readme: (user: string, repo: string) => `${user}-${repo}-readme`,
  issues: (props: { user: string; repo: string; number: number }) =>
    `${props.user}-${props.repo}-issues-${props.number}`
} as const;
