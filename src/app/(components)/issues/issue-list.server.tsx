import "server-only";
import { getIssueList } from "~/app/(actions)/issue";
import { parseIssueSearchString } from "~/lib/shared/utils.shared";
import { IssueListClient } from "./issue-list.client";
import { BASE_ISSUE_SEARCH_QUERY } from "~/lib/shared/constants";

type IssueListServerProps = { currentPage: number; queryString?: string };

export async function IssueListServer({
  currentPage,
  queryString
}: IssueListServerProps) {
  const filters = parseIssueSearchString(
    queryString ?? BASE_ISSUE_SEARCH_QUERY
  );

  const issues = await getIssueList(filters, currentPage);
  return <IssueListClient currentPage={currentPage} {...issues} />;
}
