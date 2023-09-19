import "server-only";
import { sql, eq, ilike, or, and, not } from "drizzle-orm";
import { db } from "~/lib/server/db/index.server";
import { comments } from "~/lib/server/db/schema/comment.sql";
import {
  issues,
  issueToAssignees,
  IssueStatuses
} from "~/lib/server/db/schema/issue.sql";
import { labelToIssues, labels } from "~/lib/server/db/schema/label.sql";
import { users } from "~/lib/server/db/schema/user.sql";
import { MAX_ITEMS_PER_PAGE, IN_FILTERS } from "~/lib/shared/constants";

import type { SQL } from "drizzle-orm";
import type { IssueSearchFilters } from "~/lib/shared/utils.shared";

const commentsCountPerIssueSubQuery = db
  .select({
    issue_id: comments.issue_id,
    comment_count: sql<number>`count(${comments.id})`
      .mapWith(Number)
      .as("comment_count")
  })
  .from(comments)
  .groupBy(comments.issue_id)
  .as("comments_count_per_issue");

/**
 * Main function to search for issues
 * @param filters
 * @param currentPage
 * @returns
 */
export async function searchIssues(
  filters: IssueSearchFilters,
  currentPage: number
) {
  //   let labelFilters: SQL<unknown> | undefined = undefined;

  //   if (filters.label && filters.label.length > 0) {
  //     labelFilters = or(...filters.label.map((label) => eq(labels.name, label))); // sql`${labels.name} in ${filters.label}`;
  //     //     .where(sql`${labels.name} in ${filters.label}`);

  //     //   queryFilters = and(sql`${issues.id} in ${labelSubQuery}`, queryFilters);
  //   } else if (filters["-label"] && filters["-label"].length > 0) {
  //     labelFilters = sql`${labels.name} not in ${filters["-label"]}`;
  //     //   const labelSubQuery = db
  //     //     .selectDistinct({
  //     //       issue_id: labelToIssues.issue_id
  //     //     })
  //     //     .from(labelToIssues)
  //     //     .innerJoin(labels, eq(labelToIssues.label_id, labels.id))
  //     //     .where(sql`${labels.name} not in ${filters["-label"]}`);

  //     //   queryFilters = and(sql`${issues.id} not in ${labelSubQuery}`, queryFilters);
  //   }

  //   const labelSubQuery = db
  //     .selectDistinct({
  //       issue_id: labelToIssues.issue_id
  //     })
  //     .from(labelToIssues)
  //     .innerJoin(labels, eq(labelToIssues.label_id, labels.id))
  //     .where(labelFilters)
  //     .as("label_sub_queries");
  let issueQuery = db
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
      no_of_comments:
        sql<number>`COALESCE(${commentsCountPerIssueSubQuery.comment_count}, 0)`
          .mapWith(Number)
          .as("comment_count")
    })
    .from(issues)
    .leftJoin(users, eq(users.id, issues.author_id))
    .leftJoin(comments, eq(comments.issue_id, issues.id))
    .leftJoin(issueToAssignees, eq(issueToAssignees.issue_id, issues.id))
    .leftJoin(
      commentsCountPerIssueSubQuery,
      eq(commentsCountPerIssueSubQuery.issue_id, issues.id)
    )
    .where(issueSearchfiltersToSQLConditions(filters));

  //   if (filters.label && filters.label.length > 0) {
  //     issueQuery = issueQuery.innerJoin(
  //       labelSubQuery,
  //       eq(issues.id, labelSubQuery.issue_id)
  //     );
  //   } else if (filters["-label"] && filters["-label"].length > 0) {
  //     // issueQuery = issueQuery.leftJoin(labelSubQuery, not(eq(labelSubQuery.issue_id,issues.id )))
  //   }

  console.log({
    sql: issueQuery.toSQL()
  });

  const issueList = await issueQuery

    .limit(MAX_ITEMS_PER_PAGE)
    .offset((currentPage - 1) * MAX_ITEMS_PER_PAGE);
  const id_list = issueList.map((issue) => issue.id);

  // get labels
  const labelList =
    id_list.length === 0
      ? []
      : await db
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
  const assigneeList =
    id_list.length === 0
      ? []
      : await db
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

/**
 * Transform search filters to conditions to be passed in `db.where(...)`
 * @param filters
 * @param includeStatusFilter should we also count the status filter ? (filter.is)
 * @returns
 */
function issueSearchfiltersToSQLConditions(
  filters: IssueSearchFilters,
  includeStatusFilter: boolean = true
) {
  const query = filters.query;
  let queryFilters: SQL<unknown> | undefined = undefined;

  // FIXME : remove
  console.log({
    filters
  });

  if (!filters.in) {
    filters.in = new Set(IN_FILTERS);
  }

  if (filters.in) {
    const inFilters = [];
    const searchQuery = `%${query ?? ""}%`;
    if (filters.in.has("title")) {
      inFilters.push(ilike(issues.title, searchQuery));
    }
    if (filters.in.has("body")) {
      inFilters.push(ilike(issues.body, searchQuery));
    }
    if (filters.in.has("body")) {
      inFilters.push(ilike(comments.content, searchQuery));
    }
    queryFilters = or(...inFilters);
  }

  if (filters.author || filters["-author"]) {
    if (filters["-author"]) {
      queryFilters = and(
        queryFilters,
        not(
          ilike(issues.author_username, filters["-author"].replaceAll("%", "")) // don't filter authors with `%`
        )
      );
    } else if (filters.author) {
      queryFilters = and(
        queryFilters,
        ilike(issues.author_username, filters.author.replaceAll("%", "")) // don't filter authors with `%`
      );
    }
  }
  // TODO : handle the rest of filters
  // * labels,
  // -labels,
  // * assignees
  // -assignees
  // * mentions
  // -mentions
  // * sort
  // * no

  if (filters.label && filters.label.length > 0) {
    const labelSubQuery = db
      .select({
        issue_id: labelToIssues.issue_id,
        label_count: sql`COUNT(DISTINCT ${labelToIssues.label_id})`
          .mapWith(Number)
          .as("label_count")
      })
      .from(labelToIssues)
      .innerJoin(
        labels,
        and(
          eq(labelToIssues.label_id, labels.id),
          sql`${labels.name} in ${filters.label}`
        )
      )
      .groupBy(labelToIssues.issue_id)
      .having(
        sql`COUNT(DISTINCT ${labelToIssues.label_id}) = ${filters.label.length}`
      )
      .as("label_sub_query");

    const labelSubQueryWithOnlyID = db
      .select({ issue_id: labelSubQuery.issue_id })
      .from(labelSubQuery);

    queryFilters = and(
      sql`${issues.id} in ${labelSubQueryWithOnlyID}`,
      queryFilters
    );
  } else if (filters["-label"] && filters["-label"].length > 0) {
    const labelSubQuery = db
      .select({
        issue_id: labelToIssues.issue_id,
        label_count: sql`COUNT(DISTINCT ${labelToIssues.label_id})`
          .mapWith(Number)
          .as("label_count")
      })
      .from(labelToIssues)
      .innerJoin(
        labels,
        and(
          eq(labelToIssues.label_id, labels.id),
          sql`${labels.name} in ${filters["-label"]}`
        )
      )
      .groupBy(labelToIssues.issue_id)
      .having(
        sql`COUNT(DISTINCT ${labelToIssues.label_id}) = ${filters["-label"].length}`
      )
      .as("label_sub_query");
    const labelSubQueryWithOnlyID = db
      .select({ issue_id: labelSubQuery.issue_id })
      .from(labelSubQuery);

    queryFilters = and(
      sql`${issues.id} not in ${labelSubQueryWithOnlyID}`,
      queryFilters
    );
  }

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
      status === "open"
        ? eq(issues.status, IssueStatuses.OPEN)
        : closedCondition,
      queryFilters
    );
  }

  return queryFilters;
}

/**
 * Get the statistics of the search query : the # of open/closed issues
 * @param filters
 * @returns
 */
async function getStatsForIssueSearch(filters: IssueSearchFilters) {
  const queryFilters = issueSearchfiltersToSQLConditions(filters, false);

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
      total_count: sql<number>`COALESCE(count(${issues.id}), 0)`
        .mapWith(Number)
        .as("total_count"),
      open_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${issues.status} = 'OPEN' THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("open_issue_count"),
      completed_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${issues.status} = 'CLOSED'  THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("completed_issue_count"),
      not_planned_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${issues.status} = 'NOT_PLANNED'  THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("not_planned_issue_count")
    })
    .from(statsQuery);
  return stats;
}
