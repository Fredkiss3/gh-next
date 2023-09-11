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
import { users } from "~/lib/server/db/schema/user.sql";
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

type AssignedEvent = {
  __typename: "AssignedEvent";
  actor: Actor;
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

type MentionedEvent = {
  __typename: "MentionedEvent";
  createdAt: string;
  actor: Actor;
};

type LockedEvent = {
  __typename: "LockedEvent";
  actor: Actor;
  lockReason: string;
  createdAt: string;
};

type ReferencedEvent = {
  __typename: "ReferencedEvent";
  actor: Actor;
  isCrossRepository: boolean;
  subject: {
    __typename: "Issue";
    title: string;
    number: number;
  };
};

type UserContentEdits = {
  nodes: {
    id: number;
    editedAt: string;
    diff: string | null;
    editor: Editor;
  }[];
};

type TimelineItems = {
  totalCount: number;
  nodes: (
    | AssignedEvent
    | LabeledEvent
    | UnlabeledEvent
    | ClosedEvent
    | MentionedEvent
    | LockedEvent
    | ReferencedEvent
  )[];
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

type Comment = {
  createdAt: string;
  lastEditedAt?: string; // Optional because a comment might not be edited.
  isMinimized: boolean;
  minimizedReason?: string; // Optional because a comment might not be minimized.
  updatedAt: string;
  author?: Actor;
  body: string;
  reactionGroups: ReactionGroup[];
  userContentEdits: UserContentEdits;
};

type CommentsResponse = {
  repository: {
    issue: {
      comments: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null; // Might be optional based on API responses when no further pages are present.
        };
        nodes: Comment[];
      };
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

const commentsQuery = /* GraphQL */ `
  query comments(
    $cursor: String
    $repoName: String!
    $repoOwner: String!
    $issue_number: Int!
  ) {
    repository(name: $repoName, owner: $repoOwner) {
      issue(number: $issue_number) {
        comments(after: $cursor, first: 100) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            createdAt
            lastEditedAt
            isMinimized
            minimizedReason
            updatedAt
            author {
              login
            }
            body
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

    console.log(
      `\nInserting comments for issue \x1b[34m${issue.number}\x1b[37m`
    );
    let nextCommentCursor: string | null = null;
    let commentsHasNextPage = false;
    let totalNumberOfComments = 0;

    do {
      /**
       * INSERTING COMMENTS
       */
      const {
        repository: {
          issue: {
            // @ts-expect-error
            comments: { nodes: commentResultList, pageInfo: commentsPageIngo }
          }
        }
      } = await fetchFromGithubAPI<CommentsResponse>(commentsQuery, {
        repoOwner: GITHUB_REPO_SOURCE.owner,
        repoName: GITHUB_REPO_SOURCE.name,
        cursor: nextCommentCursor,
        issue_number: issue.number
      });

      nextCommentCursor = commentsPageIngo.endCursor;
      commentsHasNextPage = commentsPageIngo.hasNextPage;

      // delete all comments from issue
      await db
        .delete(comments)
        .where(eq(comments.issue_id, issueInsertQueryResult.issue_id));

      for (const comment of commentResultList) {
        if (!comment.author) {
          continue;
        }
        totalNumberOfComments++;
        // Faker so that it generates the same login for the same user
        faker.seed(stringToNumber(comment.author.login));

        // if the user is in our DB, use that instead of a generated username & avatar url
        const dbUser = await db
          .select()
          .from(users)
          .where(sql`${users.username} ILIKE ${comment.author.login}`);

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
          created_at: new Date(issue.createdAt)
        } satisfies CommentInsert;

        const [commentInsertQueryResult] = await db
          .insert(comments)
          .values(commentPayload)
          .returning({
            comment_id: comments.id
          });

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
      }
    } while (commentsHasNextPage);
    console.log(
      `\nsuccessfully inserted \x1b[34m${totalNumberOfComments} comments\x1b[37m ✅`
    );

    console.log(
      `\nissue \x1b[34m${issue.number}\x1b[37m inserted successfully ✅`
    );
  }
} while (hasNextPage && totalIssuesFetched < MAX_ISSUES_TO_FETCH);

process.exit();
