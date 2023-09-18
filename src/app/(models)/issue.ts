import "server-only";
import { SQL, and, eq, ilike, not, or, sql } from "drizzle-orm";
import { CacheKeys } from "~/lib/server/cache-keys.server";
import { db } from "~/lib/server/db/index.server";
import {
  IssueStatuses,
  issueToAssignees,
  issues
} from "~/lib/server/db/schema/issue.sql";
import { nextCache } from "~/lib/server/rsc-utils.server";
import { users } from "~/lib/server/db/schema/user.sql";
import { comments } from "~/lib/server/db/schema/comment.sql";
import { IN_FILTERS, MAX_ITEMS_PER_PAGE } from "~/lib/shared/constants";
import { labelToIssues, labels } from "~/lib/server/db/schema/label.sql";

import type { IssueSearchFilters } from "~/lib/shared/utils.shared";
import type { Prettify } from "~/lib/types";

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

export async function getIssues(
  filters: IssueSearchFilters,
  currentPage: number
) {
  const commentsCountSubQuery = db
    .select({
      issue_id: comments.issue_id,
      comment_count: sql<number>`count(${comments.id})`
        .mapWith(Number)
        .as("comment_count")
    })
    .from(comments)
    .groupBy(comments.issue_id)
    .as("comments_count");

  const issueList = await db
    .selectDistinctOn([issues.id], {
      id: issues.id,
      title: issues.title,
      status: issues.status,
      number: issues.number,
      created_at: issues.created_at,
      excerpt: sql<string>`SUBSTRING(${issues.body} FROM 1 FOR 85) AS excerpt`,
      status_updated_at: issues.status_updated_at,
      author: {
        username: issues.author_username,
        avatar_url: issues.author_avatar_url,
        name: users.name,
        bio: users.bio,
        id: users.id,
        location: users.location
      },
      noOfComments:
        sql<number>`coalesce(${commentsCountSubQuery.comment_count}, 0) AS "comment_count"`.mapWith(
          Number
        )
    })
    .from(issues)
    .leftJoin(users, eq(users.id, issues.author_id))
    .leftJoin(comments, eq(comments.issue_id, issues.id))
    .leftJoin(labelToIssues, eq(labelToIssues.issue_id, issues.id))
    .leftJoin(labels, eq(labelToIssues.label_id, labels.id))
    .leftJoin(issueToAssignees, eq(issueToAssignees.issue_id, issues.id))
    .leftJoin(
      commentsCountSubQuery,
      eq(commentsCountSubQuery.issue_id, issues.id)
    )
    .where(issueSearchfiltersToSQLQuery(filters))
    .limit(MAX_ITEMS_PER_PAGE)
    .offset((currentPage - 1) * MAX_ITEMS_PER_PAGE);

  const id_list = issueList.map((issue) => issue.id);

  // get labels
  const labelList = await db
    .selectDistinct({
      issue_id: labelToIssues.issue_id,
      id: labels.id,
      color: labels.color,
      name: labels.name,
      description: labels.description
    })
    .from(labels)
    .innerJoin(labelToIssues, eq(labelToIssues.label_id, labels.id))
    .where(sql`${labelToIssues.issue_id} in ${id_list}`);

  // get assignees
  const assigneeList = await db
    .selectDistinct({
      issue_id: issueToAssignees.issue_id,
      username: issueToAssignees.assignee_username,
      avatar_url: issueToAssignees.assignee_avatar_url
    })
    .from(issueToAssignees)
    .where(sql`${issueToAssignees.issue_id} in ${id_list}`);

  // Group issue by labels & assignees
  const issueResult = issueList.map((issue) => {
    const labelsForIssue = labelList.filter(
      (label) => label.issue_id === issue.id
    );
    const assigneesForIssue = assigneeList.filter(
      (assignee) => assignee.issue_id === issue.id
    );
    return { ...issue, labels: labelsForIssue, assigned_to: assigneesForIssue };
  });

  // Get other statistics
  const { total_count, open_count, completed_count, not_planned_count } =
    await getStatsForIssueSearch(filters);

  return {
    issues: Object.values(issueResult),
    total_count,
    open_count,
    completed_count,
    not_planned_count
  };
}

function issueSearchfiltersToSQLQuery(
  filters: IssueSearchFilters,
  includeStatusFilter: boolean = true
) {
  const query = filters.query;
  let queryFilters: SQL<unknown> | undefined = undefined;

  if (!filters.in) {
    filters.in = new Set(IN_FILTERS);
  }

  if (filters.in) {
    const inFilters = [];
    if (filters.in.has("title")) {
      inFilters.push(ilike(issues.title, `%${query ?? ""}%`));
    }
    if (filters.in.has("body")) {
      inFilters.push(ilike(issues.body, `%${query ?? ""}%`));
    }
    if (filters.in.has("body")) {
      inFilters.push(ilike(comments.content, `%${query ?? ""}%`));
    }
    queryFilters = or(...inFilters);
  }

  // TODO : handle the rest of filters
  // ...

  if (filters.is && includeStatusFilter) {
    const status = filters.is;
    let closedCondition = not(eq(issues.status, IssueStatuses.OPEN));

    if (filters.reason) {
      closedCondition =
        filters.reason === "completed"
          ? eq(issues.status, IssueStatuses.CLOSED)
          : eq(issues.status, IssueStatuses.NOT_PLANNED);
    }

    queryFilters = and(
      queryFilters,
      status === "open"
        ? eq(issues.status, IssueStatuses.OPEN)
        : closedCondition
    );
  }

  return queryFilters;
}

async function getStatsForIssueSearch(filters: IssueSearchFilters) {
  const queryFilters = issueSearchfiltersToSQLQuery(filters, false);

  const statsQuery = db
    .selectDistinctOn([issues.id], {
      number: issues.number,
      status: issues.status,
      id: issues.id
    })
    .from(issues)
    .leftJoin(users, eq(users.id, issues.author_id))
    .leftJoin(comments, eq(comments.issue_id, issues.id))
    .leftJoin(labelToIssues, eq(labelToIssues.issue_id, issues.id))
    .leftJoin(labels, eq(labelToIssues.label_id, labels.id))
    .leftJoin(issueToAssignees, eq(issueToAssignees.issue_id, issues.id))
    .where(queryFilters)
    .groupBy(issues.id)
    .as("stats");

  const [stats] = await db
    .select({
      total_count: sql<number>`count(${issues.id})`
        .mapWith(Number)
        .as("total_count"),
      open_count:
        sql<number>`SUM(CASE WHEN ${issues.status} = 'OPEN' THEN 1 ELSE 0 END)`
          .mapWith(Number)
          .as("open_issue_count"),
      completed_count:
        sql<number>`SUM(CASE WHEN ${issues.status} = 'CLOSED'  THEN 1 ELSE 0 END)`
          .mapWith(Number)
          .as("completed_issue_count"),
      not_planned_count:
        sql<number>`SUM(CASE WHEN ${issues.status} = 'NOT_PLANNED'  THEN 1 ELSE 0 END)`
          .mapWith(Number)
          .as("not_planned_issue_count")
    })
    .from(statsQuery);
  return stats;
}

export type IssueResult = Awaited<ReturnType<typeof getIssues>>["issues"];
