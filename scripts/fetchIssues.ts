import {
  issueToAssignees,
  type IssueToAssigneeInsert
} from "~/lib/server/db/schema/issue.sql";
import {
  issues,
  type IssueInsert,
  type IssueRevisionInsert,
  issueRevisions
} from "~/lib/server/db/schema/issue.sql";
import { fetchFromGithubAPI } from "~/lib/server/utils.server";
import { faker } from "@faker-js/faker/locale/en_US";
import { env } from "~/env.mjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, type User } from "~/lib/server/db/schema/user.sql";
import { eq, sql } from "drizzle-orm";
import {
  labels,
  type LabelInsert,
  labelToIssues
} from "~/lib/server/db/schema/label.sql";
import {
  reactions,
  type ReactionType
} from "~/lib/server/db/schema/reaction.sql";
import {
  comments,
  type CommentInsert,
  commentRevisions,
  type CommentRevisionInsert
} from "~/lib/server/db/schema/comment.sql";
import {
  issueEvents,
  type IssueEvent,
  type IssueEventInsert,
  type EventType
} from "~/lib/server/db/schema/event.sql";

const db = drizzle(postgres(env.DATABASE_URL));

const GITHUB_REPO_SOURCE = {
  owner: "vercel",
  name: "next.js"
} as const;
const MAX_ISSUES_TO_FETCH = 25;

type Actor = {
  login: string;
};

type Editor = {
  login: string;
  avatarUrl: string;
};

type Label = {
  name: string;
  color: string;
  description: string | null;
};

type UserContentEdits = {
  nodes: {
    id: number;
    editedAt: string;
    diff: string | null;
    editor: Editor;
  }[];
};

type ReactionTypeFromGH =
  | "THUMBS_UP"
  | "THUMBS_DOWN"
  | "LAUGH"
  | "HOORAY"
  | "CONFUSED"
  | "HEART"
  | "ROCKET"
  | "EYES";

type ReactionGroup = {
  content: ReactionTypeFromGH;
  reactors: {
    totalCount: number;
  };
};

type IssueReponse = {
  repository: {
    issues: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
      nodes: Array<{
        title: string;
        number: number;
        createdAt: string;
        updatedAt: string;
        closedAt: string;
        state: "OPEN" | "CLOSED";
        locked: boolean;
        stateReason: "REOPENED" | "NOT_PLANNED" | "COMPLETED";
        body: string;
        userContentEdits: UserContentEdits;
        author: {
          login: string;
        };
        reactionGroups: Array<ReactionGroup>;
        assignees: {
          nodes: Array<{
            avatarUrl: string;
            login: string;
          }>;
        };
        labels: {
          nodes: Array<Label>;
        };
      }>;
    };
  };
};

const issuesQuery = /* GraphQL */ `
  query issues($cursor: String, $repoName: String!, $repoOwner: String!) {
    repository(name: $repoName, owner: $repoOwner) {
      issues(
        after: $cursor
        first: 10
        # since the start of the year 2023
        filterBy: { since: "2023-01-01T00:00:00.000Z" }
        orderBy: { field: COMMENTS, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
        nodes {
          title
          number
          createdAt
          updatedAt
          closedAt
          state
          locked
          stateReason
          body
          userContentEdits(last: 10) {
            nodes {
              editedAt
              diff
              editor {
                login
                avatarUrl
              }
            }
          }

          author {
            login
          }
          reactionGroups {
            content
            reactors {
              totalCount
            }
          }
          assignees(first: 5) {
            nodes {
              avatarUrl
              login
            }
          }
          labels(first: 10) {
            nodes {
              color
              description
              name
            }
          }
        }
      }
    }
  }
`;

type IssueComment = {
  __typename: "IssueComment";
  body: string;
  createdAt: string;
  isMinimized: boolean;
  minimizedReason?: string;
  actor?: Actor; // Comments from deleted users might not have an author.
  reactionGroups: ReactionGroup[];
  userContentEdits: UserContentEdits;
};

type RenamedTitleEvent = {
  __typename: "RenamedTitleEvent";
  actor: Actor;
  createdAt: string;
};

type AssignedEvent = {
  __typename: "AssignedEvent";
  actor: Actor;
  createdAt: string;
  assignee: {
    __typename: "User";
    login: string;
  };
};

type LabeledEvent = {
  __typename: "LabeledEvent";
  actor: Actor;
  label: Label;
  createdAt: string;
};

type UnlabeledEvent = {
  __typename: "UnlabeledEvent";
  actor: Actor;
  label: Label;
  createdAt: string;
};

type ClosedEvent = {
  __typename: "ClosedEvent";
  actor: Actor;
  stateReason: string;
  createdAt: string;
};

type LockedEvent = {
  __typename: "LockedEvent";
  actor: Actor;
  lockReason: string;
  createdAt: string;
};

type CrossReferencedEvent = {
  __typename: "CrossReferencedEvent";
  actor: Actor;
  createdAt: string;
  isCrossRepository: boolean;
  source: {
    __typename: "Issue";
    number: number;
  };
};

type TimelineItem =
  | IssueComment
  | RenamedTitleEvent
  | AssignedEvent
  | LabeledEvent
  | UnlabeledEvent
  | ClosedEvent
  | LockedEvent
  | CrossReferencedEvent;

type EventsResponse = {
  repository: {
    issue: {
      timelineItems: {
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
        totalCount: number;
        nodes: TimelineItem[];
      };
    };
  };
};

const eventsQuery = /* GraphQL */ `
  query events($cursor: String, $repoName: String!, $repoOwner: String!) {
    repository(name: $repoName, owner: $repoOwner) {
      issue(number: 42991) {
        timelineItems(
          after: $cursor
          first: 100
          itemTypes: [
            ISSUE_COMMENT
            RENAMED_TITLE_EVENT
            ASSIGNED_EVENT
            CLOSED_EVENT
            LABELED_EVENT
            LOCKED_EVENT
            CROSS_REFERENCED_EVENT
            UNLABELED_EVENT
          ]
        ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
          nodes {
            __typename
            ... on IssueComment {
              body
              createdAt
              isMinimized
              minimizedReason
              actor: author {
                login
              }
              reactionGroups {
                content
                reactors {
                  totalCount
                }
              }
              userContentEdits(last: 10) {
                nodes {
                  editedAt
                  diff
                  editor {
                    login
                    avatarUrl
                  }
                }
              }
            }
            ... on RenamedTitleEvent {
              actor {
                login
              }
              createdAt
            }
            ... on AssignedEvent {
              actor {
                login
              }
              createdAt
              assignee {
                __typename
                ... on User {
                  login
                }
              }
            }
            ... on LabeledEvent {
              actor {
                login
              }
              label {
                name
                color
                description
              }
              createdAt
            }
            ... on UnlabeledEvent {
              actor {
                login
              }
              label {
                name
                color
                description
              }
              createdAt
            }
            ... on ClosedEvent {
              actor {
                login
              }
              stateReason
              createdAt
            }
            ... on LockedEvent {
              actor {
                login
              }
              lockReason
              createdAt
            }
            ... on CrossReferencedEvent {
              actor {
                login
              }
              createdAt
              isCrossRepository
              source {
                __typename
                ... on Issue {
                  number
                }
              }
            }
          }
        }
      }
    }
  }
`;

let nextCursor: string | null = null;
let hasNextPage = false;
let totalIssuesFetched = 0;

function stringToNumber(str: string) {
  return Number.parseInt(
    [...str].map((letter, index) => letter.charCodeAt(index)).join("")
  );
}

do {
  const {
    repository: {
      // @ts-expect-error
      issues: { pageInfo, nodes }
    }
  } = await fetchFromGithubAPI<IssueReponse>(issuesQuery, {
    repoOwner: GITHUB_REPO_SOURCE.owner,
    repoName: GITHUB_REPO_SOURCE.name,
    cursor: nextCursor
  });

  nextCursor = pageInfo.endCursor;
  hasNextPage = pageInfo.hasNextPage;
  totalIssuesFetched += nodes.length;

  for (const issue of nodes) {
    /**
     * INSERTING ISSUES
     */
    console.log(
      `\nInserting issue \x1b[34m${issue.number} -  \x1b[33m${issue.title} \x1b[37m`
    );
    // Faker so that it generates the same login for the same user
    faker.seed(stringToNumber(issue.author.login));

    // if the user is in our DB, use that instead of a generated username & avatar url
    const dbUser = await db
      .select()
      .from(users)
      .where(sql`${users.username} ILIKE ${issue.author.login}`);

    let currentUser = dbUser[0];
    const issuePayload = {
      title: issue.title,
      number: issue.number,
      body: issue.body,
      author_id: currentUser ? currentUser.id : null,
      author_username: currentUser
        ? currentUser.username
        : faker.internet.userName().replaceAll(".", "_").toLowerCase(),
      author_avatar_url: currentUser
        ? currentUser.avatar_url
        : faker.image.avatarGitHub(),
      is_locked: issue.locked,
      created_at: new Date(issue.createdAt),
      status: issue.stateReason === "NOT_PLANNED" ? "NOT_PLANNED" : issue.state
    } satisfies IssueInsert;

    const [issueInsertQueryResult] = await db
      .insert(issues)
      .values(issuePayload)
      .onConflictDoUpdate({
        target: issues.number,
        set: issuePayload
      })
      .returning({
        issue_id: issues.id
      });

    /**
     * INSERTING ISSUE REVISIONS
     */
    for (const edition of issue.userContentEdits.nodes) {
      // Skip revisions without a diff
      if (!edition.diff) {
        continue;
      }

      faker.seed(stringToNumber(edition.editor.login));
      // wipe out any revision existing for the issue
      // Because we don't have any way to handle conflicts as of now
      await db
        .delete(issueRevisions)
        .where(eq(issueRevisions.issue_id, issueInsertQueryResult.issue_id));

      // Replace with user from DB if it exists
      const dbUser = await db
        .select()
        .from(users)
        .where(sql`${users.username} ILIKE ${edition.editor.login}`);

      let currentUser = dbUser[0];
      const revisionPayload = {
        issue_id: issueInsertQueryResult.issue_id,
        revised_by_username: currentUser
          ? currentUser.username
          : faker.internet.userName().replaceAll(".", "_").toLowerCase(),
        revised_by_avatar_url: currentUser
          ? currentUser.avatar_url
          : faker.image.avatarGitHub(),
        created_at: new Date(edition.editedAt),
        updated_description: edition.diff
      } satisfies IssueRevisionInsert;

      await db.insert(issueRevisions).values(revisionPayload);
    }

    /**
     * INSERTING LABELS
     */
    for (const label of issue.labels.nodes) {
      const labelPayload = {
        name: label.name,
        color: `#${label.color}`,
        description: label.description ?? undefined
      } satisfies LabelInsert;

      const [labelInsertResult] = await db
        .insert(labels)
        .values(labelPayload)
        .onConflictDoUpdate({
          target: labels.name,
          set: labelPayload
        })
        .returning({
          label_id: labels.id
        });

      /**
       * INSERTING LABEL RELATIONS TO ISSUES
       */
      // wipe out any label associated to this issue
      // Because we don't have any way to handle conflicts for this table
      await db
        .delete(labelToIssues)
        .where(eq(labelToIssues.issue_id, issueInsertQueryResult.issue_id));

      await db.insert(labelToIssues).values({
        issue_id: issueInsertQueryResult.issue_id,
        label_id: labelInsertResult.label_id
      });
    }

    /**
     * INSERTING ASSIGNEES
     */
    for (const assignee of issue.assignees.nodes) {
      faker.seed(stringToNumber(assignee.login));
      // wipe out any assignee existing for the issue
      // Because we don't have any way to handle conflicts for this table
      await db
        .delete(issueToAssignees)
        .where(eq(issueToAssignees.issue_id, issueInsertQueryResult.issue_id));

      // Replace with user from DB if it exists
      const dbUser = await db
        .select()
        .from(users)
        .where(sql`${users.username} ILIKE ${assignee.login}`);

      let currentUser = dbUser[0];

      const issueToAssigneePayload = {
        issue_id: issueInsertQueryResult.issue_id,
        assignee_username: currentUser
          ? currentUser.username
          : faker.internet.userName().replaceAll(".", "_").toLowerCase(),
        assignee_avatar_url: currentUser
          ? currentUser.avatar_url
          : faker.image.avatarGitHub()
      } satisfies IssueToAssigneeInsert;

      await db.insert(issueToAssignees).values(issueToAssigneePayload);
    }

    /**
     * INSERTING REACTIONS
     */
    for (const reactionGroup of issue.reactionGroups) {
      // wipe out any reaction associated to this issue
      // Because we don't have any way to handle conflicts for this table
      await db
        .delete(reactions)
        .where(eq(reactions.issue_id, issueInsertQueryResult.issue_id));

      const reactionTypeMapping = {
        THUMBS_UP: "PLUS_ONE",
        THUMBS_DOWN: "MINUS_ONE",
        EYES: "EYES",
        CONFUSED: "CONFUSED",
        HEART: "HEART",
        HOORAY: "HOORAY",
        ROCKET: "ROCKET",
        LAUGH: "LAUGH"
      } satisfies Record<ReactionTypeFromGH, ReactionType>;

      for (let i = 0; i < reactionGroup.reactors.totalCount; i++) {
        await db.insert(reactions).values({
          issue_id: issueInsertQueryResult.issue_id,
          type: reactionTypeMapping[reactionGroup.content]
        });
      }
    }

    console.log(`\nInserting events for issue \x1b[34m${issue.number}\x1b[37m`);

    // delete all comments from issue
    await db
      .delete(comments)
      .where(eq(comments.issue_id, issueInsertQueryResult.issue_id));

    // delete all events from issue
    await db
      .delete(issueEvents)
      .where(eq(issueEvents.issue_id, issueInsertQueryResult.issue_id));

    let nextEventsCursor: string | null = null;
    let eventsHasNextPage = false;
    let totalNumberOfEvents = 0;

    do {
      /**
       * INSERTING EVENTS
       */
      const {
        repository: {
          issue: {
            timelineItems: {
              nodes: eventsResultList,
              // @ts-expect-error
              pageInfo: eventsPageInfo
            }
          }
        }
      } = await fetchFromGithubAPI<EventsResponse>(eventsQuery, {
        repoOwner: GITHUB_REPO_SOURCE.owner,
        repoName: GITHUB_REPO_SOURCE.name,
        cursor: nextEventsCursor,
        issue_number: issue.number
      });

      nextEventsCursor = eventsPageInfo.endCursor;
      eventsHasNextPage = eventsPageInfo.hasNextPage;

      for (const event of eventsResultList) {
        totalNumberOfEvents++;
        let currentUser: User | null | undefined = null;

        if (event.actor) {
          // Faker seed so that it generates the same login for the same user
          faker.seed(stringToNumber(event.actor.login));
          // if the user is in our DB, use that instead of a generated username & avatar url
          const dbUser = await db
            .select()
            .from(users)
            .where(sql`${users.username} ILIKE ${event.actor.login}`);
          currentUser = dbUser[0];
        }

        const eventTypeMapping = {
          AssignedEvent: "ASSIGN_USER",
          ClosedEvent: "TOGGLE_STATUS",
          LockedEvent: "TOGGLE_STATUS",
          CrossReferencedEvent: "ISSUE_MENTION",
          RenamedTitleEvent: "CHANGE_TITLE",
          IssueComment: "ADD_COMMENT",
          UnlabeledEvent: "REMOVE_LABEL",
          LabeledEvent: "ADD_LABEL"
        } satisfies Record<typeof event.__typename, EventType>;

        let eventPayload: IssueEventInsert = {
          issue_id: issueInsertQueryResult.issue_id,
          initiator_id: currentUser ? currentUser.id : null,
          initiator_username: currentUser
            ? currentUser.username
            : faker.internet.userName().replaceAll(".", "_").toLowerCase(),
          initiator_avatar_url: currentUser
            ? currentUser.avatar_url
            : faker.image.avatarGitHub(),
          type: eventTypeMapping[event.__typename]
        };

        if (event.__typename === "IssueComment") {
          const comment = event;
          if (!comment.actor) {
            continue;
          }

          // Faker so that it generates the same login for the same user
          faker.seed(stringToNumber(comment.actor.login));

          // if the user is in our DB, use that instead of a generated username & avatar url
          const dbUser = await db
            .select()
            .from(users)
            .where(sql`${users.username} ILIKE ${comment.actor.login}`);

          let currentUser = dbUser[0];
          const commentPayload = {
            content: comment.body,
            issue_id: issueInsertQueryResult.issue_id,
            author_id: currentUser ? currentUser.id : null,
            author_username: currentUser
              ? currentUser.username
              : faker.internet.userName().replaceAll(".", "_").toLowerCase(),
            author_avatar_url: currentUser
              ? currentUser.avatar_url
              : faker.image.avatarGitHub(),
            created_at: new Date(comment.createdAt)
          } satisfies CommentInsert;

          const [commentInsertQueryResult] = await db
            .insert(comments)
            .values(commentPayload)
            .returning({
              comment_id: comments.id
            });

          // Add event
          eventPayload.comment_id = commentInsertQueryResult.comment_id;

          /**
           * INSERTING COMMENT REVISIONS
           */
          for (const edition of comment.userContentEdits.nodes) {
            // Skip revisions without a diff
            if (!edition.diff) {
              continue;
            }

            faker.seed(stringToNumber(edition.editor.login));
            // wipe out any revision existing for the comment
            await db
              .delete(commentRevisions)
              .where(
                eq(
                  commentRevisions.comment_id,
                  commentInsertQueryResult.comment_id
                )
              );

            const revisionPayload = {
              comment_id: commentInsertQueryResult.comment_id,
              created_at: new Date(edition.editedAt),
              updated_content: edition.diff
            } satisfies CommentRevisionInsert;

            await db.insert(commentRevisions).values(revisionPayload);
          }

          /**
           * INSERTING COMMENT REACTIONS
           */
          for (const reactionGroup of comment.reactionGroups) {
            // wipe out any reaction associated to this comment
            await db
              .delete(reactions)
              .where(
                eq(reactions.comment_id, commentInsertQueryResult.comment_id)
              );

            const reactionTypeMapping = {
              THUMBS_UP: "PLUS_ONE",
              THUMBS_DOWN: "MINUS_ONE",
              EYES: "EYES",
              CONFUSED: "CONFUSED",
              HEART: "HEART",
              HOORAY: "HOORAY",
              ROCKET: "ROCKET",
              LAUGH: "LAUGH"
            } satisfies Record<ReactionTypeFromGH, ReactionType>;

            for (let i = 0; i < reactionGroup.reactors.totalCount; i++) {
              await db.insert(reactions).values({
                comment_id: commentInsertQueryResult.comment_id,
                type: reactionTypeMapping[reactionGroup.content]
              });
            }
          }
        } else if (event.__typename === "AssignedEvent") {
          // Faker seed so that it generates the same login for the same user
          faker.seed(stringToNumber(event.assignee.login));
          // if the user is in our DB, use that instead of a generated username & avatar url
          const dbUser = await db
            .select()
            .from(users)
            .where(sql`${users.username} ILIKE ${event.assignee.login}`);
          const currentUser = dbUser[0];

          eventPayload = {
            ...eventPayload,
            assignee_username: currentUser
              ? currentUser.username
              : faker.internet.userName().replaceAll(".", "_").toLowerCase(),
            assignee_avatar_url: currentUser
              ? currentUser.avatar_url
              : faker.image.avatarGitHub()
          };
        }

        await db.insert(issueEvents).values(eventPayload);
      }
    } while (eventsHasNextPage);

    console.log(
      `\nsuccessfully inserted \x1b[34m${totalNumberOfEvents} events\x1b[37m ✅`
    );

    console.log(
      `\nissue \x1b[34m${issue.number}\x1b[37m inserted successfully ✅`
    );
  }
} while (hasNextPage && totalIssuesFetched < MAX_ISSUES_TO_FETCH);

process.exit();
