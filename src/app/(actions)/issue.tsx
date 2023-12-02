"use server";

import { getLabelsByName } from "~/app/(models)/label";
import {
  getIssueAssigneesByUsername,
  getIssueAssigneesByUsernameOrName,
  getIssueAuthorsByName,
  getIssueAuthorsByUsername,
  getSingleIssue
} from "~/app/(models)/issues";

import { AsyncIssueHoverCardContents } from "~/app/(components)/hovercard/async-issue-hovercard-contents";
import { issueSearchListOutputValidator } from "~/app/(models)/dto/issue-search-output-validator";
import { searchIssues } from "~/app/(models)/issues/search";

import { getAuthedUser } from "./auth";
import { cache } from "react";

import type { IssueSearchFilters } from "~/lib/shared/utils.shared";

/**
 * We use `promise` because server actions are not batched,
 * if a server action is running, the others will have to wait
 * this hack prevents that => because returning promise objects ared returned automatically
 */
export async function filterIssueAuthorsByName(name: string) {
  return {
    promise: getIssueAuthorsByName(name)
  };
}

export async function filterIssueAuthorsByUsername(username: string) {
  return {
    promise: getIssueAuthorsByUsername(username)
  };
}

export async function filterIssueAssignees(
  name: string,
  checkFullName?: boolean
) {
  return {
    promise: checkFullName
      ? getIssueAssigneesByUsernameOrName(name)
      : getIssueAssigneesByUsername(name)
  };
}

export async function getIssueList(filters: IssueSearchFilters, page: number) {
  const date = Date.now();
  console.time(`\n[${date}] get Issue List`);
  const {
    issues,
    completed_count,
    not_planned_count,
    total_count,
    open_count
  } = await searchIssues(filters, page, await getAuthedUser());
  console.timeEnd(`\n[${date}] get Issue List`);

  let noOfIssuesClosed = completed_count + not_planned_count;
  if (filters.is === "closed" && filters.reason) {
    noOfIssuesClosed =
      filters.reason === "completed" ? completed_count : not_planned_count;
  }

  return issueSearchListOutputValidator.parse({
    issues,
    noOfIssuesOpen: open_count,
    noOfIssuesClosed,
    totalCount: total_count
  });
}

export async function filterLabelsByName(name: string) {
  return {
    promise: getLabelsByName(name)
  };
}

export const getIssueDetail = cache(async function getIssueDetail(
  number: number
) {
  return getSingleIssue(number);
});

export async function getIssueHoverCardContents(
  user: string,
  repo: string,
  no: number
) {
  return <AsyncIssueHoverCardContents user={user} repo={repo} no={no} />;
}
