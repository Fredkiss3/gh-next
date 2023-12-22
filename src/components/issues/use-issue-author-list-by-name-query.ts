import { useQuery } from "@tanstack/react-query";
import { filterIssueAuthorsByName } from "~/actions/issue.action";

export function useIssueAuthorListByNameQuery({
  name = ""
}: {
  name?: string;
}) {
  return useQuery({
    queryKey: ["ISSUE_AUTHOR_LIST_BY_NAME", name],
    queryFn: () =>
      filterIssueAuthorsByName(name).then((result) => result.promise),
    placeholderData: (previousData) => previousData
  });
}
