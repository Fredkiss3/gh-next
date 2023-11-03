import "server-only";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { CacheKeys } from "~/lib/server/cache-keys.server";
import { db } from "~/lib/server/db/index.server";
import { issueToAssignees, issues } from "~/lib/server/db/schema/issue.sql";
import { nextCache } from "~/lib/server/rsc-utils.server";
import { users, type User } from "~/lib/server/db/schema/user.sql";
import { comments } from "~/lib/server/db/schema/comment.sql";
import { UN_MATCHABLE_USERNAME } from "~/lib/shared/constants";
import { issueUserMentions } from "~/lib/server/db/schema/mention.sql";

export async function getOpenIssuesCount() {
  const fn = nextCache(
    async () => {
      const [count] = await db
        .select({
          count: sql<number>`count(*)`.mapWith(Number)
        })
        .from(issues)
        .where(eq(issues.status, "OPEN"));
      return count.count;
    },
    {
      tags: CacheKeys.openIssuesCount()
    }
  );

  return fn();
}

const issueAuthorsByNamePrepared = db
  .selectDistinct({
    username: issues.author_username,
    avatar: issues.author_avatar_url,
    name: users.name
  })
  .from(issues)
  .leftJoin(users, eq(users.id, issues.author_id))
  .where(
    or(
      ilike(issues.author_username, sql.placeholder("name")),
      ilike(users.name, sql.placeholder("name"))
    )
  )
  .prepare("issue_authors_by_name");

export async function getIssueAuthorsByName(name: string) {
  return await issueAuthorsByNamePrepared.execute({
    name: "%" + name + "%"
  });
}

const issueAuthorsByUsernamePrepared = db
  .selectDistinct({
    username: issues.author_username,
    avatar: issues.author_avatar_url,
    name: users.name
  })
  .from(issues)
  .leftJoin(users, eq(users.id, issues.author_id))
  .where(ilike(issues.author_username, sql.placeholder("username")))
  .limit(20)
  .prepare("issue_authors_by_username");

export async function getIssueAuthorsByUsername(username: string) {
  return await issueAuthorsByUsernamePrepared.execute({
    username: username + "%"
  });
}

const issueAssigneesByUsernamePrepared = db
  .selectDistinct({
    username: issueToAssignees.assignee_username,
    avatar: issueToAssignees.assignee_avatar_url,
    name: users.name
  })
  .from(issues)
  .rightJoin(issueToAssignees, eq(issueToAssignees.issue_id, issues.id))
  .leftJoin(users, eq(users.id, issueToAssignees.assignee_id))
  .where(ilike(issueToAssignees.assignee_username, sql.placeholder("username")))
  .limit(20)
  .prepare("issue_assignees_by_username");

export async function getIssueAssigneesByUsername(username: string) {
  return await issueAssigneesByUsernamePrepared.execute({
    username: username + "%"
  });
}

const issueAssigneesByUsernameOrNamePrepared = db
  .selectDistinct({
    username: issueToAssignees.assignee_username,
    avatar: issueToAssignees.assignee_avatar_url,
    name: users.name
  })
  .from(issues)
  .rightJoin(issueToAssignees, eq(issueToAssignees.issue_id, issues.id))
  .leftJoin(users, eq(users.id, issueToAssignees.assignee_id))
  .where(
    or(
      ilike(issueToAssignees.assignee_username, sql.placeholder("name")),
      ilike(users.name, sql.placeholder("name"))
    )
  )
  .limit(20)
  .prepare("issue_assignees_by_username_or_name");

export async function getIssueAssigneesByUsernameOrName(name: string) {
  return await issueAssigneesByUsernameOrNamePrepared.execute({
    name: name + "%"
  });
}

const singleIssuePrepared = db
  .select()
  .from(issues)
  .where(eq(issues.number, sql.placeholder("number")));

export async function getSingleIssue(number: number) {
  return await singleIssuePrepared.execute({
    number
  });
}

export async function getMultipleIssues(
  numbers: number[],
  currentUser?: User | null
) {
  const issueWhereUserCommentedSubQuery = db
    .selectDistinct({
      issue_id: comments.issue_id,
      author_username: comments.author_username
    })
    .from(comments)
    .where(
      ilike(
        comments.author_username,
        currentUser?.username ?? UN_MATCHABLE_USERNAME
      )
    )
    .as("issue_commented");

  return await db
    .select({
      status: issues.status,
      title: issues.title,
      number: issues.number,
      createdAt: issues.created_at,
      excerpt: sql<string>`SUBSTRING(${issues.body} FROM 1 FOR 85) AS excerpt`,
      author: {
        username: issues.author_username,
        avatar_url: issues.author_avatar_url,
        name: users.name,
        bio: users.bio,
        id: users.id,
        location: users.location
      },
      mentioned_user: issueUserMentions.username,
      commented_user: issueWhereUserCommentedSubQuery.author_username
    })
    .from(issues)
    .leftJoin(users, eq(users.id, issues.author_id))
    .leftJoin(
      issueUserMentions,
      and(
        eq(issues.id, issueUserMentions.issue_id),
        ilike(
          issueUserMentions.username,
          currentUser?.username ?? UN_MATCHABLE_USERNAME
        )
      )
    )
    .leftJoin(
      issueWhereUserCommentedSubQuery,
      eq(issues.id, issueWhereUserCommentedSubQuery.issue_id)
    )
    .where(sql`${issues.number} in ${numbers}`);
}
