import { useQuery } from "@tanstack/react-query";
import { getLabelsByName } from "~/app/(actions)/issue";

export function useIssueLabelListByNameQuery({ name = "", enabled = true }: { name?: string, enabled?: boolean }) {
  return useQuery({
    queryKey: ["ISSUE_LABEL_LIST_BY_NAME", name],
    queryFn: () => getLabelsByName(name).then((result) => result.promise),
    keepPreviousData: true,
    enabled
  });
}
