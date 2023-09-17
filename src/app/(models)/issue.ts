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
  let issuesQuery = db
    .selectDistinct({
      id: issues.id,
      title: issues.title,
      status: issues.status,
      author: {
        username: issues.author_username,
        avatar: issues.author_avatar_url,
        name: users.name,
        bio: users.bio,
        location: users.location
      },
      label: {
        id: labels.id,
        color: labels.color,
        name: labels.name,
        description: labels.description
      }
    })
    .from(issues)
    .leftJoin(users, eq(users.id, issues.author_id))
    .leftJoin(comments, eq(comments.issue_id, issues.id))
    .leftJoin(labelToIssues, eq(labelToIssues.issue_id, issues.id))
    .leftJoin(labels, eq(labelToIssues.label_id, labels.id));
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

  issuesQuery = issuesQuery.limit(25).offset((currentPage - 1) * 25);
  console.dir({ filters, sql: issuesQuery.toSQL().sql }, { depth: null });
  return await issuesQuery;
}
