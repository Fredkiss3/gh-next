import { useQuery } from "@tanstack/react-query";
import { filterIssueAssignees } from "~/app/(actions)/issue";

export function useIssueAssigneeListQuery({
  name = "",
  enabled,
  checkFullName
}: {
  name?: string;
  enabled: boolean;
  checkFullName?: boolean;
}) {
  return useQuery({
    queryKey: ["ISSUE_ASSIGNEE_LIST", name],
    queryFn: () =>
      filterIssueAssignees(name, checkFullName).then(
        (result) => result.promise
      ),
    enabled,
    placeholderData: (previousData) => previousData
  });
}
