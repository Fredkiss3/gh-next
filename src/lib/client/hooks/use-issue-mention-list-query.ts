import { useQuery } from "@tanstack/react-query";
import { filterIssueMentions } from "~/app/(actions)/issue";

export function useIssueMentionListQuery({
  name = "",
  enabled,
}: {
  name?: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ["ISSUE_MENTION_LIST", name],
    queryFn: () => filterIssueMentions(name).then((result) => result.promise),
    enabled,
  });
}
