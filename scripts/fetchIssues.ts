import {
  GITHUB_AUTHOR_USERNAME,
  GITHUB_REPOSITORY_NAME,
  PRODUCTION_DOMAIN
} from "./../src/lib/shared/constants";
import {
  issueToAssignees,
  type IssueToAssigneeInsert,
  type IssueLockReason
} from "~/lib/server/db/schema/issue.sql";
import {
  issues,
  type IssueInsert,
  type IssueRevisionInsert,
  issueRevisions
} from "~/lib/server/db/schema/issue.sql";
import { fetchFromGithubAPI } from "~/lib/server/utils.server";
import { faker } from "@faker-js/faker/locale/en_US";
import { _envObject as env } from "~/env-config.mjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, type User } from "~/lib/server/db/schema/user.sql";
import { and, eq, like, sql } from "drizzle-orm";
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
  type IssueEventInsert,
  type EventType
} from "~/lib/server/db/schema/event.sql";
import { MAX_ITEMS_PER_PAGE } from "~/lib/shared/constants";
import { issueUserMentions } from "~/lib/server/db/schema/mention.sql";
import { repositories } from "~/lib/server/db/schema/repository.sql";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkGithub from "remark-github";
import { VFile } from "vfile";

const db = drizzle(postgres(env.DATABASE_URL));

const GITHUB_REPO_SOURCE = {
  owner: "vercel",
  name: "next.js"
} as const;
const MAX_ISSUES_TO_FETCH =
  (env.NEXT_PUBLIC_VERCEL_URL.startsWith("http://localhost") ? 1 : 5) *
  MAX_ITEMS_PER_PAGE;

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

type GithubIssue = {
  title: string;
  number: number;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  state: "OPEN" | "CLOSED";
  locked: boolean;
  stateReason: "REOPENED" | "NOT_PLANNED" | "COMPLETED";
  activeLockReason: IssueLockReason | null;
  body: string;
  userContentEdits: UserContentEdits;
  author?: {
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
};

type IssueReponse = {
  repository: {
    issues: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
      nodes: Array<GithubIssue>;
    };
  };
};
type SingleIssueReponse = {
  repository: {
    issue: GithubIssue;
  };
};

const issuesQuery = /* GraphQL */ `
  query issues($cursor: String, $repoName: String!, $repoOwner: String!) {
    repository(name: $repoName, owner: $repoOwner) {
      issues(
        after: $cursor
        first: 25
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
          activeLockReason
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

const singleIssueQuery = /* GraphQL */ `
  query singleIssue($number: Int!, $repoName: String!, $repoOwner: String!) {
    repository(name: $repoName, owner: $repoOwner) {
      issue(number: $number) {
        title
        number
        createdAt
        updatedAt
        closedAt
        state
        locked
        stateReason
        activeLockReason
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
  currentTitle: string;
  previousTitle: string;
};

type AssignedEvent = {
  __typename: "AssignedEvent";
  actor: Actor;
  createdAt: string;
  assignee: {
    __typename: "User";
    login: string;
    avatarUrl: string;
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
  stateReason: "REOPENED" | "NOT_PLANNED" | "COMPLETED";
  createdAt: string;
};

type ReopenedEvent = {
  __typename: "ReopenedEvent";
  actor: Actor;
  stateReason: "REOPENED" | "NOT_PLANNED" | "COMPLETED";
  createdAt: string;
};

type CrossReferencedEvent = {
  __typename: "CrossReferencedEvent";
  actor: Actor;
  createdAt: string;
  isCrossRepository: boolean;
  source:
    | {
        __typename: "Issue";
        number: number;
      }
    | { __typename: "PullRequest" };
};

type TimelineItem =
  | IssueComment
  | RenamedTitleEvent
  | AssignedEvent
  | LabeledEvent
  | UnlabeledEvent
  | ClosedEvent
  | ReopenedEvent
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
    } | null;
  };
};

const eventsQuery = /* GraphQL */ `
  query events(
    $cursor: String
    $issue_number: Int!
    $repoName: String!
    $repoOwner: String!
  ) {
    repository(name: $repoName, owner: $repoOwner) {
      issue(number: $issue_number) {
        timelineItems(
          after: $cursor
          first: 100
          itemTypes: [
            ISSUE_COMMENT
            RENAMED_TITLE_EVENT
            ASSIGNED_EVENT
            CLOSED_EVENT
            LABELED_EVENT
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
              currentTitle
              previousTitle
              createdAt
            }
            ... on AssignedEvent {
              actor {
                login
                avatarUrl
              }
              createdAt
              assignee {
                __typename
                ... on User {
                  login
                  avatarUrl
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
            ... on ReopenedEvent {
              actor {
                login
              }
              stateReason
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

async function insertSingleIssue(issue: GithubIssue) {
  if (!issue?.author) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, GITHUB_AUTHOR_USERNAME));

  if (!user) return null;

  const [repository] = await db
    .select()
    .from(repositories)
    .where(
      and(
        eq(repositories.name, GITHUB_REPOSITORY_NAME),
        eq(repositories.creator_id, user.id)
      )
    );

  if (!repository) return null;
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

  type IssueLinkingValues = {
    user: string;
    project: string;
    no: string;
    comment_id?: number;
    type: "issue";
    createdAt: Date;
    initiator?: {
      id: number;
      avatar_url: string;
      username: string;
    };
  };

  type MentionLinkingValues = {
    comment_id?: number;
    type: "mention";
    user: string;
  };
  type LinkingEventValues = IssueLinkingValues | MentionLinkingValues;

  const linkingEvents: LinkingEventValues[] = [];
  const preprocessedIssueBody = await remark()
    .use(remarkGfm)
    .use(remarkGithub, {
      repository: `${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`,
      mentionStrong: false,
      replaceFullLinks: false,
      baseURL: "github.com",
      buildUrl: (values) => {
        switch (values.type) {
          case "issue":
            linkingEvents.push({
              ...values,
              createdAt: new Date(issue.createdAt),
              initiator: currentUser
            });

            // only replaces the URL when replacing full urls (from github), else don't do any replacement
            // as #<ref> are automatically managed by the <Markdown> component
            return !values.fullUrlMatch
              ? false
              : `https://${PRODUCTION_DOMAIN}/${values.user}/${values.project}/issues/${values.no}`;
          case "mention":
            linkingEvents.push(values);
            return false;
          default:
            return false;
        }
      }
    })
    .process(
      new VFile({
        basename: "example.md",
        value: issue.body
      })
    );

  const issuePayload = {
    title: issue.title,
    number: issue.number,
    body: String(preprocessedIssueBody),
    status_updated_at: new Date(issue.closedAt ?? issue.createdAt),
    author_id: currentUser ? currentUser.id : null,
    author_username: currentUser
      ? currentUser.username
      : faker.internet.userName().replaceAll(".", "_").toLowerCase(),
    author_avatar_url: currentUser
      ? currentUser.avatar_url
      : faker.image.avatarGitHub(),
    is_locked: issue.locked,
    lock_reason: issue.activeLockReason,
    created_at: new Date(issue.createdAt),
    status: issue.stateReason === "NOT_PLANNED" ? "NOT_PLANNED" : issue.state,
    repository_id: repository.id
  } satisfies IssueInsert;

  const [issueInsertQueryResult] = await db
    .insert(issues)
    .values(issuePayload)
    .onConflictDoUpdate({
      target: [issues.repository_id, issues.number],
      set: issuePayload
    })
    .returning({
      issue_id: issues.id,
      number: issues.number
    });

  console.log("--- INSERTING ISSUES REVISIONS ---");
  let noOfIssueRevisionsInserted = 0;

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
    noOfIssueRevisionsInserted++;
  }

  console.log(
    `\n${noOfIssueRevisionsInserted} issue revisions inserted successfully ✅`
  );

  console.log("--- INSERTING LABELS ---");
  let noOfLabelsInserted = 0;
  // wipe out any label associated to this issue
  // Because we don't have any way to handle conflicts for this table
  await db
    .delete(labelToIssues)
    .where(eq(labelToIssues.issue_id, issueInsertQueryResult.issue_id));
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
    await db.insert(labelToIssues).values({
      issue_id: issueInsertQueryResult.issue_id,
      label_id: labelInsertResult.label_id
    });

    noOfLabelsInserted++;
  }

  console.log(`\n${noOfLabelsInserted} labels inserted successfully ✅`);

  console.log("--- INSERTING ASSIGNEES ---");
  let noOfAssigneesInserted = 0;
  for (const assignee of issue.assignees.nodes) {
    // faker.seed(stringToNumber(assignee.login));
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
      assignee_username: currentUser ? currentUser.username : assignee.login,
      assignee_avatar_url: currentUser
        ? currentUser.avatar_url
        : assignee.avatarUrl
    } satisfies IssueToAssigneeInsert;

    await db.insert(issueToAssignees).values(issueToAssigneePayload);
    noOfAssigneesInserted++;
  }
  console.log(`\n${noOfAssigneesInserted} assignees inserted successfully ✅`);

  // wipe out any reaction associated to this issue
  // Because we don't have any way to handle conflicts for this table
  await db
    .delete(reactions)
    .where(eq(reactions.issue_id, issueInsertQueryResult.issue_id));

  console.log("--- INSERTING REACTIONS ---");
  let noOfReactionsInserted = 0;
  for (const reactionGroup of issue.reactionGroups) {
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
    noOfReactionsInserted++;
  }

  console.log(`\n${noOfReactionsInserted} reactions inserted successfully ✅`);

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
  let eventsHasNextPage = true;
  let totalNumberOfEvents = 0;

  while (eventsHasNextPage) {
    /**
     * INSERTING EVENTS
     */
    const eventResponse: EventsResponse = await fetchFromGithubAPI(
      eventsQuery,
      {
        repoOwner: GITHUB_REPO_SOURCE.owner,
        repoName: GITHUB_REPO_SOURCE.name,
        cursor: nextEventsCursor,
        issue_number: issue.number
      }
    );

    if (!eventResponse.repository.issue) continue;

    nextEventsCursor =
      eventResponse.repository.issue.timelineItems.pageInfo.endCursor;
    eventsHasNextPage =
      eventResponse.repository.issue.timelineItems.pageInfo.hasNextPage;

    const eventsToInsert: IssueEventInsert[] = [];
    for (const event of eventResponse.repository.issue.timelineItems.nodes) {
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
        ReopenedEvent: "TOGGLE_STATUS",
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
        type: eventTypeMapping[event.__typename],
        created_at: new Date(event.createdAt)
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

        const preprocessedCommentBody = await remark()
          .use(remarkGfm)
          .use(remarkGithub, {
            repository: `${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`,
            mentionStrong: false,
            replaceFullLinks: false,
            baseURL: "github.com",
            buildUrl: (values) => {
              switch (values.type) {
                case "issue":
                  linkingEvents.push({
                    ...values,
                    comment_id: commentInsertQueryResult.comment_id,
                    createdAt: new Date(event.createdAt),
                    initiator: currentUser
                  });
                  // only replaces the URL when replacing full urls (from github), else don't do any replacement
                  // as #<ref> are automatically managed by the <Markdown> component
                  return !values.fullUrlMatch
                    ? false
                    : `https://${PRODUCTION_DOMAIN}/${values.user}/${values.project}/issues/${values.no}`;
                case "mention":
                  linkingEvents.push({
                    ...values,
                    comment_id: commentInsertQueryResult.comment_id
                  });
                  return false;
                default:
                  return false;
              }
            }
          })
          .process(
            new VFile({
              basename: "example.md",
              value: comment.body
            })
          );

        await db.update(comments).set({
          content: String(preprocessedCommentBody)
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

        // wipe out any reaction associated to this comment
        await db
          .delete(reactions)
          .where(eq(reactions.comment_id, commentInsertQueryResult.comment_id));

        /**
         * INSERTING COMMENT REACTIONS
         */
        for (const reactionGroup of comment.reactionGroups) {
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
            : event.assignee.login,
          assignee_avatar_url: currentUser
            ? currentUser.avatar_url
            : event.assignee.avatarUrl
        };
      } else if (event.__typename === "ClosedEvent") {
        eventPayload.status =
          event.stateReason === "NOT_PLANNED" ? "NOT_PLANNED" : "CLOSED";
      } else if (event.__typename === "ReopenedEvent") {
        eventPayload.status = "OPEN";
      } else if (event.__typename === "RenamedTitleEvent") {
        eventPayload.old_title = event.previousTitle;
        eventPayload.new_title = event.currentTitle;
      } else if (
        event.__typename === "LabeledEvent" ||
        event.__typename === "UnlabeledEvent"
      ) {
        const { label } = event;
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

        eventPayload.label_id = labelInsertResult.label_id;
      } else {
        continue;
      }

      eventsToInsert.push(eventPayload);
    }

    if (eventsToInsert.length > 0) {
      await db.insert(issueEvents).values(eventsToInsert).returning({
        id: issueEvents.id
      });
    }
    console.log(
      `\ninserted \x1b[34m${eventsToInsert.length} events\x1b[37m ✅`
    );
  }

  console.log(
    `\nsuccessfully inserted \x1b[34m${totalNumberOfEvents} events\x1b[37m ✅`
  );

  console.log(
    `\nissue \x1b[34m${issue.number}\x1b[37m inserted successfully ✅`
  );

  console.log("--- INSERTING ISSUES USER MENTIONS ---");
  let noOfMentionsInserted = 0;
  const found: string[] = [];
  for (const occurence of linkingEvents.filter(
    (event) => event.type === "mention"
  )) {
    const username = occurence.user;

    if (!found.includes(username)) {
      noOfMentionsInserted++;
      found.push(username);

      await db
        .insert(issueUserMentions)
        .values({
          username,
          issue_id: issueInsertQueryResult.issue_id,
          comment_id: occurence.comment_id
        })
        .onConflictDoNothing();
    }
  }

  console.log(
    `\n${noOfMentionsInserted} user mention inserted successfully ✅`
  );

  console.log("--- INSERTING ISSUES REFERENCES ---");
  let noOfReferencesInserted = 0;
  for (const event of linkingEvents.filter(
    (event) => event.type === "issue"
  ) as IssueLinkingValues[]) {
    let dbIssues = await db
      .select({
        id: issues.id
      })
      .from(issues)
      .where(eq(issues.number, Number(event.no)));

    let mentionnedIssueId: number | null = dbIssues[0]?.id;
    if (dbIssues.length === 0) {
      const {
        repository: { issue }
      } = await fetchFromGithubAPI<SingleIssueReponse>(singleIssueQuery, {
        repoOwner: GITHUB_REPO_SOURCE.owner,
        repoName: GITHUB_REPO_SOURCE.name,
        number: Number(event.no)
      });
      mentionnedIssueId = await insertSingleIssue(issue);
    }

    if (!mentionnedIssueId) {
      continue;
    }

    const eventPayload = {
      issue_id: issueInsertQueryResult.issue_id,
      comment_id: event.comment_id,
      initiator_id: event.initiator?.id,
      initiator_username: event.initiator
        ? event.initiator.username
        : faker.internet.userName().replaceAll(".", "_").toLowerCase(),
      initiator_avatar_url: event.initiator
        ? event.initiator.avatar_url
        : faker.image.avatarGitHub(),
      type: "ISSUE_MENTION",
      created_at: new Date(event.createdAt),
      mentionned_issue_id: mentionnedIssueId
    } satisfies IssueEventInsert;
    await db.insert(issueEvents).values(eventPayload);
    noOfReferencesInserted++;
  }

  console.log(
    `\nsuccessfully inserted ${noOfReferencesInserted} issue references ✅`
  );

  return issueInsertQueryResult.issue_id;
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
    await insertSingleIssue(issue);
  }
} while (hasNextPage && totalIssuesFetched < MAX_ISSUES_TO_FETCH);

process.exit();
