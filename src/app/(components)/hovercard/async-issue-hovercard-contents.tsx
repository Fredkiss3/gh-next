import "server-only";

import * as React from "react";
import { getAuthedUser } from "~/app/(actions)/auth";
import { getSingleIssueWithLabelAndUser } from "~/app/(models)/issues";
import { IssueHoverCardContents } from "~/app/(components)/hovercard/issue-hovercard-contents";

export type AsyncIssueHoverCardContentsProps = {
  user: string;
  repo: string;
  no: number;
};

export async function AsyncIssueHoverCardContents({
  user,
  repo,
  no
}: AsyncIssueHoverCardContentsProps) {
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
