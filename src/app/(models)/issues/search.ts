import "server-only";
import { sql, eq, ilike, or, and, not, desc, asc } from "drizzle-orm";
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
import { ReactionTypes, reactions } from "~/lib/server/db/schema/reaction.sql";
import { issueUserMentions } from "~/lib/server/db/schema/mention.sql";

import type { User } from "~/lib/server/db/schema/user.sql";
import type { SQL } from "drizzle-orm";
import type { IssueSearchFilters } from "~/lib/shared/utils.shared";

/**
 * Main function to search for issues
 * @param filters
 * @param currentPage
 * @returns
 */
export async function searchIssues(
  filters: IssueSearchFilters,
  currentPage: number,
  currentUser?: User | null
) {
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

  const reactionCountQuery = db
    .select({
      issue_id: reactions.issue_id,
      plus_one_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.PLUS_ONE} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("plus_one_count"),
      minus_one_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.MINUS_ONE} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("minus_one_count"),
      confused_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.CONFUSED} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("confused_count"),
      eyes_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.EYES} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("eyes_count"),
      heart_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.HEART} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("heart_count"),
      hooray_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.HOORAY} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("hooray_count"),
      laugh_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.LAUGH} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("laugh_count"),
      rocket_count:
        sql<number>`COALESCE(SUM(CASE WHEN ${reactions.type} = ${ReactionTypes.ROCKET} THEN 1 ELSE 0 END), 0)`
          .mapWith(Number)
          .as("rocket_count")
    })
    .from(reactions)
    .groupBy(reactions.issue_id)
    .as("reaction_count_per_issue");

  let issueQuery = db
    .selectDistinct({
      id: issues.id,
      title: issues.title,
      status: issues.status,
      number: issues.number,
      created_at: issues.created_at,
      updated_at: issues.updated_at,
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
          .as("comment_count"),
      plus_one_count: reactionCountQuery.plus_one_count,
      minus_one_count: reactionCountQuery.minus_one_count,
      confused_count: reactionCountQuery.confused_count,
      eyes_count: reactionCountQuery.eyes_count,
      heart_count: reactionCountQuery.heart_count,
      hooray_count: reactionCountQuery.hooray_count,
      laugh_count: reactionCountQuery.laugh_count,
      rocket_count: reactionCountQuery.rocket_count
    })
    .from(issues)
    .leftJoin(users, eq(users.id, issues.author_id))
    .leftJoin(comments, eq(comments.issue_id, issues.id))
    .leftJoin(
      commentsCountPerIssueSubQuery,
      eq(commentsCountPerIssueSubQuery.issue_id, issues.id)
    )
    .leftJoin(reactionCountQuery, eq(reactionCountQuery.issue_id, issues.id))
    .where(issueSearchfiltersToSQLConditions(filters, true, currentUser));

  let orderBy: SQL<unknown>;
  switch (filters.sort) {
    case "created-asc":
      orderBy = asc(issues.created_at);
      break;
    case "updated-asc":
      orderBy = asc(issues.updated_at);
      break;
    case "updated-desc":
      orderBy = desc(issues.updated_at);
      break;
    case "comments-asc":
      orderBy = asc(commentsCountPerIssueSubQuery.comment_count);
      break;
    case "comments-desc":
      orderBy = desc(commentsCountPerIssueSubQuery.comment_count);
      break;
    case "reactions-+1-desc":
      orderBy = sql`${reactionCountQuery.plus_one_count} DESC NULLS LAST`;
      break;
    case "reactions--1-desc":
      orderBy = sql`${reactionCountQuery.minus_one_count} DESC NULLS LAST`;
      break;
    case "reactions-eyes-desc":
      orderBy = sql`${reactionCountQuery.eyes_count} DESC NULLS LAST`;
      break;
    case "reactions-heart-desc":
      orderBy = sql`${reactionCountQuery.heart_count} DESC NULLS LAST`;
      break;
    case "reactions-rocket-desc":
      orderBy = sql`${reactionCountQuery.rocket_count} DESC NULLS LAST`;
      break;
    case "reactions-tada-desc":
      orderBy = sql`${reactionCountQuery.hooray_count} DESC NULLS LAST`;
      break;
    case "reactions-thinking_face-desc":
      orderBy = sql`${reactionCountQuery.confused_count} DESC NULLS LAST`;
      break;
    case "reactions-smile-desc":
      orderBy = sql`${reactionCountQuery.laugh_count} DESC NULLS LAST`;
      break;
    default:
      orderBy = sql`${issues.created_at} DESC NULLS LAST`;
      break;
  }
  issueQuery = issueQuery.orderBy(orderBy);

  if (process.env.NODE_ENV === "development") {
    console.log({
      sql: issueQuery.toSQL()
    });
  }

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
    await getStatsForIssueSearch(filters, currentUser);

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
  includeStatusFilter: boolean = true,
  currentUser?: User | null
) {
  const query = filters.query;
  let queryFilters: SQL<unknown> | undefined = undefined;

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
      // Handle `@me` author and replace it with the current authenticated user
      let searchingAuthor: string | undefined = filters["-author"];
      if (filters.author === "@me") {
        searchingAuthor = currentUser?.username;
      } else {
        searchingAuthor = filters["-author"];
      }

      if (searchingAuthor) {
        queryFilters = and(
          queryFilters,
          not(
            ilike(
              issues.author_username,
              searchingAuthor.replaceAll("%", "").replaceAll(`@`, "")
            ) // don't filter authors with `%`
          )
        );
      }
    } else if (filters.author) {
      // Handle `@me` author and replace it with the current authenticated user
      let searchingAuthor: string | undefined = filters.author;
      if (filters.author === "@me") {
        searchingAuthor = currentUser?.username;
      } else {
        searchingAuthor = filters.author;
      }
      if (searchingAuthor) {
        queryFilters = and(
          queryFilters,
          ilike(
            issues.author_username,
            searchingAuthor.replaceAll("%", "").replaceAll(`@`, "")
          ) // don't filter authors with `%`
        );
      }
    }
  }

  if (filters.no?.includes("label")) {
    // select all issues with labels
    const labelSubQuery = db
      .selectDistinctOn([labelToIssues.issue_id], {
        issue_id: labelToIssues.issue_id
      })
      .from(labelToIssues)
      .innerJoin(labels, eq(labelToIssues.label_id, labels.id));

    // then filter out them from the query
    queryFilters = and(sql`${issues.id} not in ${labelSubQuery}`, queryFilters);
  } else {
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
    }
    if (filters["-label"] && filters["-label"].length > 0) {
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
  }

  if (filters.no?.includes("assignee")) {
    const assigneeSubQuery = db
      .select({
        issue_id: issueToAssignees.issue_id
      })
      .from(issueToAssignees)
      .groupBy(issueToAssignees.issue_id)
      .as("assignee_sub_query");

    const assigneeSubQueryWithOnlyID = db
      .select({ issue_id: assigneeSubQuery.issue_id })
      .from(assigneeSubQuery);

    queryFilters = and(
      sql`${issues.id} not in ${assigneeSubQueryWithOnlyID}`,
      queryFilters
    );
  } else {
    if (filters.assignee && filters.assignee.length > 0) {
      const assigneeSubQuery = db
        .select({
          issue_id: issueToAssignees.issue_id,
          assignee_count:
            sql`COUNT(DISTINCT ${issueToAssignees.assignee_username})`
              .mapWith(Number)
              .as("assignee_count")
        })
        .from(issueToAssignees)
        .where(
          sql`${issueToAssignees.assignee_username} in ${filters.assignee
            .map((assignee) =>
              assignee
                .replaceAll("@", "")
                .replaceAll("%", "")
                .replaceAll("@me", currentUser?.username ?? "")
            )
            .filter(Boolean)}`
        )
        .groupBy(issueToAssignees.issue_id)
        .having(
          sql`COUNT(DISTINCT ${issueToAssignees.assignee_username}) = ${filters.assignee.length}`
        )
        .as("assignee_sub_query");

      const assigneeSubQueryWithOnlyID = db
        .select({ issue_id: assigneeSubQuery.issue_id })
        .from(assigneeSubQuery);

      queryFilters = and(
        sql`${issues.id} in ${assigneeSubQueryWithOnlyID}`,
        queryFilters
      );
    }
    if (filters["-assignee"] && filters["-assignee"].length > 0) {
      const assigneeSubQuery = db
        .select({
          issue_id: issueToAssignees.issue_id,
          assignee_count:
            sql`COUNT(DISTINCT ${issueToAssignees.assignee_username})`
              .mapWith(Number)
              .as("assignee_count")
        })
        .from(issueToAssignees)
        .where(
          sql`${issueToAssignees.assignee_username} in ${filters["-assignee"]
            .map((assignee) =>
              assignee
                .replaceAll("@", "")
                .replaceAll("%", "")
                .replaceAll("@me", currentUser?.username ?? "")
            )
            .filter(Boolean)}`
        )
        .groupBy(issueToAssignees.issue_id)
        .having(
          sql`COUNT(DISTINCT ${issueToAssignees.assignee_username}) = ${filters["-assignee"].length}`
        )
        .as("assignee_sub_query");

      const assigneeSubQueryWithOnlyID = db
        .select({ issue_id: assigneeSubQuery.issue_id })
        .from(assigneeSubQuery);

      queryFilters = and(
        sql`${issues.id} not in ${assigneeSubQueryWithOnlyID}`,
        queryFilters
      );
    }
  }

  if (filters.mentions) {
    // Handle `@me` mention and replace it with the current authenticated user
    let mentionnedUser: string | undefined = filters.mentions;
    if (filters.mentions === "@me") {
      mentionnedUser = currentUser?.username;
    } else {
      mentionnedUser = filters.mentions.replaceAll(`@`, "").replaceAll("%", "");
    }

    // mentionnedUser will be `undefined` if the user is not authenticated but searched for `@me`
    if (mentionnedUser) {
      const mentionSubQuery = db
        .selectDistinctOn([issues.id], {
          issue_id: issues.id
        })
        .from(issueUserMentions)
        .rightJoin(issues, eq(issueUserMentions.issue_id, issues.id))
        .where(ilike(issueUserMentions.username, mentionnedUser))
        .as("mentionSubQuery");
      const mentionSubQueryOnlyID = db
        .select({ issue_id: mentionSubQuery.issue_id })
        .from(mentionSubQuery);

      queryFilters = and(
        sql`${issues.id} in ${mentionSubQueryOnlyID}`,
        queryFilters
      );
    }
  } else if (filters["-mentions"]) {
    // Handle `@me` mention and replace it with the current authenticated user
    let mentionnedUser: string | undefined = filters["-mentions"];
    if (filters.mentions === "@me") {
      mentionnedUser = currentUser?.username;
    } else {
      mentionnedUser = filters["-mentions"]
        .replaceAll(`@`, "")
        .replaceAll("%", "");
    }

    // mentionnedUser will be `undefined` if the user is not authenticated but searched for `@me`
    if (mentionnedUser) {
      const mentionSubQuery = db
        .selectDistinctOn([issues.id], {
          issue_id: issues.id
        })
        .from(issueUserMentions)
        .rightJoin(issues, eq(issueUserMentions.issue_id, issues.id))
        .where(ilike(issueUserMentions.username, mentionnedUser))
        .as("mentionSubQuery");

      const mentionSubQueryOnlyID = db
        .select({ issue_id: mentionSubQuery.issue_id })
        .from(mentionSubQuery);

      queryFilters = and(
        sql`${issues.id} not in ${mentionSubQueryOnlyID}`,
        queryFilters
      );
    }
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
async function getStatsForIssueSearch(
  filters: IssueSearchFilters,
  currentUser?: User | null
) {
  const queryFilters = issueSearchfiltersToSQLConditions(
    filters,
    false,
    currentUser
  );

  const statsQuery = db
    .selectDistinctOn([issues.id], {
      status: issues.status,
      id: issues.id
    })
    .from(issues)
    .leftJoin(users, eq(users.id, issues.author_id))
    .leftJoin(comments, eq(comments.issue_id, issues.id))
    .leftJoin(labelToIssues, eq(labelToIssues.issue_id, issues.id))
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
