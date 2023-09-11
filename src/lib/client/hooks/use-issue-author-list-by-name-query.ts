import { useQuery } from "@tanstack/react-query";
import { filterIssueAuthorsByName } from "~/app/(actions)/issue";

export function useIssueAuthorListByNameQuery({
  name = ""
}: {
  name?: string;
}) {
  return useQuery({
    queryKey: ["ISSUE_AUTHOR_LIST_BY_NAME", name],
    queryFn: () =>
      filterIssueAuthorsByName(name).then((result) => result.promise),
    keepPreviousData: true
  });
}
