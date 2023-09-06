import "server-only";
import { getIssueList } from "~/app/(actions)/issue";
import { wait } from "~/lib/shared/utils.shared";
import { IssueListClient } from "./issue-list.client";

type IssueListServerProps = { currentPage: number };

export async function IssueListServer({ currentPage }: IssueListServerProps) {
  await wait(500);

  const issues = await getIssueList();
  return <IssueListClient currentPage={currentPage} {...issues} />;
}
