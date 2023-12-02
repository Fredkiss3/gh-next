export const CacheKeys = {
  github: () => ["GITHUB_REPO_DATA"],
  labelCount: () => ["LABEL_COUNT"],
  openIssuesCount: () => ["OPEN_ISSUES_COUNT"],
  readme: (user: string, repo: string) => [user, repo, `readme`],
  issues: (props: { user: string; repo: string; number: number }) => [
    props.user,
    props.repo,
    "issues",
    props.number
  ],
  issueHovercard: (props: { user: string; repo: string; number: number }) => [
    "ISSUE_HOVERCARD",
    props.user,
    props.repo,
    props.number
  ]
} as const;
