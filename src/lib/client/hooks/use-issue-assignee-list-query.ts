import { useQuery } from "@tanstack/react-query";
import { filterIssueAssignees } from "~/app/(actions)/issue";

export function useIssueAssigneeListQuery({
  name = "",
  enabled,
}: {
  name?: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ["ISSUE_ASSIGNEE_LIST", name],
    queryFn: () => filterIssueAssignees(name).then((result) => result.promise),
    enabled,
  });
}
