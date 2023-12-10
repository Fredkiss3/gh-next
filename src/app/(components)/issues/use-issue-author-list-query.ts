import { useQuery } from "@tanstack/react-query";
import { filterIssueAuthorsByUsername } from "~/app/(actions)/issue.action";

export function useIssueAuthorListQuery({
  name = "",
  enabled
}: {
  name?: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ["ISSUE_AUTHOR_LIST", name],
    queryFn: () =>
      filterIssueAuthorsByUsername(name).then((result) => result.promise),
    enabled
  });
}
