import { useQuery } from "@tanstack/react-query";
import { getIssueHoverCardContents } from "~/app/(actions)/issue.action";
import { CacheKeys } from "~/lib/shared/cache-keys.shared";

type UseIssueHoverCardContentsArgs = {
  user: string;
  repository: string;
  no: number;
};
export function useIssueHoverCardContents({
  user,
  repository: repo,
  no: number
}: UseIssueHoverCardContentsArgs) {
  return useQuery({
    queryKey: CacheKeys.issueHovercard({
      user,
      repo,
      number
    }),
    queryFn: () => getIssueHoverCardContents(user, repo, number)
  });
}
