import { users, usersRelations } from "./schema/user";
import {
  issues,
  issuesRelations,
  issueRevisions,
  issueRevisionsRelations,
  issueUserSubscriptionRelations,
  issueUserSubscriptions,
} from "./schema/issue";
import {
  labels,
  labelToIssues,
  labelRelations,
  labelToIssuesRelations,
} from "./schema/label";
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
import { neonConfig, Client } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "~/env.mjs";
import { cache } from "react";

neonConfig.fetchConnectionCache = true;

export const getDBClient = cache(async () => {
  const neonClient = new Client({
    connectionString: env.NEON_DB_URL,
  });
  await neonClient.connect();

  return drizzle(neonClient, {
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
  });
});
