export const CacheKeys = {
  github: () => ["GITHUB_REPO_DATA"],
  labelCount: () => ["LABEL_COUNT"],
  openIssuesCount: () => ["OPEN_ISSUES_COUNT"],
  readme: (user: string, repo: string, updatedAt: number | string | Date) => [
    user,
    repo,
    `readme`,
    new Date(updatedAt).getTime()
  ],
  issues: (props: {
    user: string;
    repo: string;
    number: number;
    updatedAt: number | string | Date;
  }) => [
    props.user,
    props.repo,
    "issues",
    props.number,
    new Date(props.updatedAt).getTime()
  ],
  issueHovercard: (props: { user: string; repo: string; number: number }) => [
    "ISSUE_HOVERCARD",
    props.user,
    props.repo,
    props.number
  ]
} as const;
