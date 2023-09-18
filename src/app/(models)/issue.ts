import "server-only";
import { SQL, and, eq, ilike, or, sql } from "drizzle-orm";
import { CacheKeys } from "~/lib/server/cache-keys.server";
import { db } from "~/lib/server/db/index.server";
import {
  IssueStatuses,
  issueToAssignees,
  issues
} from "~/lib/server/db/schema/issue.sql";
import { nextCache } from "~/lib/server/rsc-utils.server";
import { users } from "~/lib/server/db/schema/user.sql";
import type { IssueSearchFilters } from "~/lib/shared/utils.shared";
import { comments } from "~/lib/server/db/schema/comment.sql";
import { IN_FILTERS } from "~/lib/shared/constants";
import { labelToIssues, labels } from "~/lib/server/db/schema/label.sql";
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

  let issuesQuery = db
    .selectDistinct({
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
      label: {
        id: labels.id,
        color: labels.color,
        name: labels.name,
        description: labels.description
      },
      assignee: {
        username: issueToAssignees.assignee_username,
        avatar_url: issueToAssignees.assignee_avatar_url
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
    );
  const query = filters.query;

  let queryFilters: SQL<unknown> | undefined = undefined;
  let queryFiltersWithoutStatusFilter: SQL<unknown> | undefined = undefined;

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

  queryFiltersWithoutStatusFilter = queryFilters;
  if (filters.is) {
    const status = filters.is;
    queryFilters = and(
      queryFilters,
      status === "open"
        ? eq(issues.status, IssueStatuses.OPEN)
        : or(
            eq(issues.status, IssueStatuses.CLOSED),
            eq(issues.status, IssueStatuses.NOT_PLANNED)
          )
    );
  }

  issuesQuery = issuesQuery.where(queryFilters);

  // TODO : handle the rest of filters
  // ...

  // apply pagination
  issuesQuery = issuesQuery.limit(25).offset((currentPage - 1) * 25);

  console.dir({ filters, sql: issuesQuery.toSQL().sql }, { depth: null });
  // execute the query
  const issueList = await issuesQuery;

  type IssueResult = (typeof issueList)[number];
  type IssueResultList = Omit<IssueResult, "label" | "assignee"> & {
    labels: Array<Exclude<IssueResult["label"], null>>;
    assigned_to: Array<Exclude<IssueResult["assignee"], null>>;
  };

  // Group issue by labels & assignees
  const issueResult = issueList.reduce(
    (acc, current) => {
      const id = current.id;

      if (acc[id]) {
        const labelIncluded = Boolean(
          acc[id].labels.find((label) => label?.id === current.label?.id)
        );
        const assigneeIncluded = Boolean(
          acc[id].assigned_to.find(
            (assignee) => assignee?.username === current.assignee?.username
          )
        );

        if (!labelIncluded && current.label) {
          acc[id].labels.push(current.label);
        }
        if (!assigneeIncluded && current.assignee) {
          acc[id].assigned_to.push(current.assignee);
        }
      } else {
        const { label, assignee, ...rest } = current;
        acc[id] = {
          ...rest,
          // @ts-expect-error
          labels: [label].filter(Boolean),
          // @ts-expect-error
          assigned_to: [assignee].filter(Boolean)
        };
      }

      return acc;
    },
    {} as Record<number, Prettify<IssueResultList>>
  );

  // Get other status
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
    .where(queryFiltersWithoutStatusFilter)
    .groupBy(issues.id)
    .as("stats");

  const [{ total_count, open_count, closed_count }] = await db
    .select({
      total_count: sql<number>`count(${issues.id})`
        .mapWith(Number)
        .as("total_count"),
      open_count:
        sql<number>`SUM(CASE WHEN ${issues.status} = 'OPEN' THEN 1 ELSE 0 END) AS open_issue_count`.mapWith(
          Number
        ),
      closed_count:
        sql<number>`SUM(CASE WHEN ${issues.status} IN ('CLOSED', 'NOT_PLANNED')  THEN 1 ELSE 0 END) AS closed_issue_count`.mapWith(
          Number
        )
    })
    .from(statsQuery);

  return {
    issues: Object.values(issueResult),
    total_count,
    open_count,
    closed_count
  };
}

export type IssueResult = Awaited<ReturnType<typeof getIssues>>["issues"];
