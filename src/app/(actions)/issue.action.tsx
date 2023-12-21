"use server";

import { getLabelsByName } from "~/app/(models)/label";
import {
  getIssueAssigneesByUsername,
  getIssueAssigneesByUsernameOrName,
  getIssueAuthorsByName,
  getIssueAuthorsByUsername,
  getSingleIssueWithLabelAndUser
} from "~/app/(models)/issues";

import { issueSearchListOutputValidator } from "~/app/(models)/dto/issue-search-output-validator";
import { searchIssues } from "~/app/(models)/issues/search";

import { getAuthedUser } from "./auth.action";
import { cache } from "react";

import type { IssueSearchFilters } from "~/lib/shared/utils.shared";
import { IssueHoverCardContents } from "~/app/(components)/hovercard/issue-hovercard-contents";

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

export async function getIssueHoverCard(
  user: string,
  repo: string,
  no: number
) {
  return <AsyncIssueHoverCardContents user={user} repo={repo} no={no} />;
}

async function AsyncIssueHoverCardContents({
  user,
  repo,
  no
}: {
  user: string;
  repo: string;
  no: number;
}) {
  const authedUser = await getAuthedUser();
  const issueFound = await getSingleIssueWithLabelAndUser(
    {
      no,
      user,
      project: repo
    },
    authedUser
  );

  if (!issueFound) {
    return <div className="p-5 text-sm">Unable to fetch this issue</div>;
  }

  return (
    <IssueHoverCardContents
      id={issueFound.number}
      status={issueFound.status}
      title={issueFound.title}
      excerpt={issueFound.excerpt}
      createdAt={issueFound.createdAt}
      labels={issueFound.labels}
      isAuthor={authedUser?.id === issueFound.author.id}
      isMentioned={authedUser?.username === issueFound.mentioned_user}
      hasCommented={authedUser?.username === issueFound.commented_user}
      userAvatarURL={authedUser?.avatar_url}
    />
  );
}
