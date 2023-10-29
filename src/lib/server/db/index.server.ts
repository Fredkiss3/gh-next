import {
  issueUserMentions,
  issueMentionsRelations
} from "./schema/mention.sql";
import { users, usersRelations } from "./schema/user.sql";
import {
  issues,
  issuesRelations,
  issueRevisions,
  issueRevisionsRelations,
  issueUserSubscriptionRelations,
  issueUserSubscriptions
} from "./schema/issue.sql";
import {
  labels,
  labelToIssues,
  labelRelations,
  labelToIssuesRelations
} from "./schema/label.sql";
import {
  comments,
  commentsRelations,
  commentRevisions,
  commentRevisionsRelations
} from "./schema/comment.sql";
import { issueEvents, issueEventsRelations } from "./schema/event.sql";
import { reactions, reactionsRelations } from "./schema/reaction.sql";
import { env } from "~/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  min: 1,
  max: 5
});

export const db = drizzle(pool, {
  logger: true,
  schema: {
    users,
    issues,
    labels,
    labelToIssues,
    comments,
    reactions,
    issueRevisions,
    commentRevisions,
    issueEvents,
    issueUserSubscriptions,
    issueMentions: issueUserMentions,
    // relations
    issueUserSubscriptionRelations,
    issueEventsRelations,
    issueRevisionsRelations,
    commentRevisionsRelations,
    usersRelations,
    issuesRelations,
    labelRelations,
    labelToIssuesRelations,
    commentsRelations,
    reactionsRelations,
    issueMentionsRelations
  }
});
