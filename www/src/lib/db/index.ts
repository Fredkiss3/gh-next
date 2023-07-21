import {
  labels,
  labelToIssues,
  labelRelations,
  labelToIssuesRelations,
} from "./schema/label";
import {
  issues,
  issuesRelations,
  issueRevisions,
  issueRevisionsRelations,
  issueUserSubscriptionRelations,
  issueUserSubscriptions,
} from "./schema/issue";
import { users, usersRelations } from "./schema/user";
import {
  comments,
  commentsRelations,
  commentRevisions,
  commentRevisionsRelations,
} from "./schema/comment";
import {
  assignActivities,
  changeTitleActivities,
  editLabelsActivities,
  mentionActivities,
  toggleActivities,
  editActiviyToLabelsRelations,
  assignActivitiesRelations,
  changeTitleActivitiesRelations,
  editActiviyToLabels,
  editLabelsActivitiesRelations,
  issueMentionActivitiesRelations,
  issueToggleActivitiesRelations,
} from "./schema/activity";
import { reactions, reactionsRelations } from "./schema/reaction";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/http";
import { env } from "~/env.mjs";

export const db = drizzle(
  createClient({
    url: env.TURSO_DB_URL,
    authToken: env.TURSO_DB_TOKEN,
  }),
  {
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
      assignActivities,
      changeTitleActivities,
      editLabelsActivities,
      mentionActivities,
      toggleActivities,
      editActiviyToLabels,
      issueUserSubscriptions,
      // relations
      issueUserSubscriptionRelations,
      editActiviyToLabelsRelations,
      assignActivitiesRelations,
      changeTitleActivitiesRelations,
      editLabelsActivitiesRelations,
      issueMentionActivitiesRelations,
      issueToggleActivitiesRelations,
      issueRevisionsRelations,
      commentRevisionsRelations,
      usersRelations,
      issuesRelations,
      labelRelations,
      labelToIssuesRelations,
      commentsRelations,
      reactionsRelations,
    },
  }
);
