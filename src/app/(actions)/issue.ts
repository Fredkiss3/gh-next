"use server";

import { IssueStatuses } from "~/lib/server/db/schema/issue.sql";
import { wait } from "~/lib/shared/utils.shared";
import { getLabelsByName } from "~/app/(models)/label";
import {
  getIssueAssigneesByUsername,
  getIssueAssigneesByUsernameOrName,
  getIssueAuthorsByName,
  getIssueAuthorsByUsername
} from "~/app/(models)/issue";

import type { IssueListResult } from "~/lib/server/dto/issue-list.server";
import type { IssueSearchFilters } from "~/lib/shared/utils.shared";

/**
 * We use `promise` because server actions are not batched,
 * if a server action is running, the others will have to wait
 * this hack prevents that => because returning promise objects ared returned automatically
 */
export async function filterIssueAuthorsByName(name: string) {
  return {
    promise: getIssueAuthorsByName(name)
  };
}

export async function filterIssueAuthorsByUsername(username: string) {
  return {
    promise: getIssueAuthorsByUsername(username)
  };
}

export async function filterIssueAssignees(
  name: string,
  checkFullName?: boolean
) {
  return {
    promise: checkFullName
      ? getIssueAssigneesByUsernameOrName(name)
      : getIssueAssigneesByUsername(name)
  };
}

const issues = [
  {
    id: 1,
    title:
      "[NEXT-1160] Clicking Links in intercepted routes does not unmount the interceptor route",
    author: {
      username: "Fredkiss3",
      name: "Adrien KISSIE",
      bio: "I write code",
      location: "France",
      avatar_url: "https://avatars.githubusercontent.com/u/38298743?v=4"
    },
    assigned_to: [
      {
        username: "balazsorban45",
        avatar_url: "https://avatars.githubusercontent.com/u/18369201?v=4"
      }
    ],
    labels: [],
    noOfComments: 0,
    status: IssueStatuses.OPEN,
    status_updated_at: new Date(),
    created_at: new Date()
  },
  {
    id: 53360,
    title: "Docs: fix colour in image about automatic fetch() request deduping",
    description: `What is the improvement or update you wish to see?

    The colour in the image is incorrect (blue instead of red) for the request C in component B.
    Is there any context that might help us understand?
    
    No.
    Does the docs page already exist? Please link to it.
    
    https://nextjs.org/docs/app/building-your-application/data-fetching#automatic-fetch-request-deduping`,
    author: {
      username: "Fredkiss3",
      name: "Adrien KISSIE",
      bio: "I write code",
      location: "France",
      avatar_url: "https://avatars.githubusercontent.com/u/38298743?v=4"
    },
    labels: [
      {
        id: 4,
        color: "#bfdec3",
        name: "template: documentation"
      }
    ],
    noOfComments: 0,
    status: IssueStatuses.OPEN,
    status_updated_at: new Date(),
    created_at: new Date(),
    assigned_to: []
  },
  {
    id: 2,
    title:
      "[NEXT-1160] Clicking Links in intercepted routes does not unmount the interceptor route",
    author: {
      username: "Fredkiss3",
      name: "Adrien KISSIE",
      bio: "I write code",
      location: "France",
      avatar_url: "https://avatars.githubusercontent.com/u/38298743?v=4"
    },
    assigned_to: [],
    labels: [
      {
        id: 3,
        color: "#fddf99",
        name: "template: bug",
        description:
          "A user has filled out the bug report template. Issue needs triaging"
      },
      {
        id: 4,
        color: "#bfdec3",
        name: "template: documentation"
      }
    ],
    noOfComments: 3,
    status: IssueStatuses.CLOSED,
    status_updated_at: new Date(),
    created_at: new Date()
  },
  {
    id: 3,
    title:
      "[NEXT-1160] Clicking Links in intercepted routes does not unmount the interceptor route",
    author: {
      username: "Fredkiss3",
      name: "Adrien KISSIE",
      bio: "I write code",
      location: "France",
      avatar_url: "https://avatars.githubusercontent.com/u/38298743?v=4"
    },
    assigned_to: [
      {
        username: "shadcn",
        avatar_url: "https://avatars.githubusercontent.com/u/124599?v=4"
      },
      {
        username: "QuiiBz",
        avatar_url: "https://avatars.githubusercontent.com/u/43268759?v=4"
      }
    ],
    labels: [
      {
        id: 1,
        color: "#d5a7fa",
        name: "linear: next",
        description: "tracked issue"
      },
      {
        id: 2,
        color: "#c38eb0",
        name: "area: app",
        description: "app directory (appDir: true)"
      },
      {
        id: 3,
        color: "#fddf99",
        name: "template: bug",
        description:
          "A user has filled out the bug report template. Issue needs triaging"
      }
    ],
    noOfComments: 1,
    status: IssueStatuses.NOT_PLANNED,
    status_updated_at: new Date(),
    created_at: new Date()
  }
] satisfies IssueListResult["issues"];

export async function getIssueList(
  filters: IssueSearchFilters,
  page: number
): Promise<IssueListResult> {
  return {
    issues,
    noOfIssuesOpen: 115,
    noOfIssuesClosed: 100,
    totalCount: 215
  };
}

export async function filterLabelsByName(name: string) {
  return {
    promise: getLabelsByName(name)
  };
}
