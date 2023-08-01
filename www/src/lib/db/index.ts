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
import { neonConfig, neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "~/env.mjs";

neonConfig.fetchConnectionCache = true;

const sql = neon(env.NEON_DB_URL);
export const db = drizzle(sql, {
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
