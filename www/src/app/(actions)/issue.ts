"use server";

import { IssueStatuses } from "~/lib/db/schema/issue";

const authorList = [
  {
    name: "nobody",
  },
  {
    username: "balazsorban45",
    name: "Balázs Orbán",
    avatar: "https://avatars.githubusercontent.com/u/18369201?v=4",
  },
  {
    username: "shadcn",
    name: "shadcn",
    avatar: "https://avatars.githubusercontent.com/u/124599?v=4",
  },
  {
    username: "QuiiBz",
    name: "Tom Lienard",
    avatar: "https://avatars.githubusercontent.com/u/43268759?v=4",
  },
  {
    username: "AndrewIngram",
    name: "Andy Ingram",
    avatar: "https://avatars.githubusercontent.com/u/35227?v=4",
  },
  {
    username: "duongductrong",
    name: "Trong Duong",
    avatar: "https://avatars.githubusercontent.com/u/39333905?v=4",
  },
  {
    username: "karlhorky",
    name: "Karl Horky",
    avatar: "https://avatars.githubusercontent.com/u/1935696?v=4",
  },
];

// FIXME: Change this to actually query the DB in production
export async function filterIssueAuthors(name: string) {
  return authorList.filter(
    (item) =>
      item.username &&
      item.name &&
      (item.username.toLowerCase().startsWith(name.toLowerCase()) ||
        item.name.toLowerCase().includes(name.toLowerCase()))
  ) as Array<Required<(typeof authorList)[number]>>;
}

// FIXME: Change this to actually query the DB in production
export async function filterIssueAssignees(name: string) {
  return authorList.filter(
    (item) =>
      item.username?.toLowerCase().startsWith(name.toLowerCase()) ||
      item.name?.toLowerCase().includes(name.toLowerCase())
  );
}

const issues = [
  {
    id: 1,
    title:
      "[NEXT-1160] Clicking Links in intercepted routes does not unmount the interceptor route",
    author: "Fredkiss3",
    assigned_to: [
      {
        username: "balazsorban45",
        avatar_url: "https://avatars.githubusercontent.com/u/18369201?v=4",
      },
    ],
    labels: [],
    noOfComments: 0,
    status: IssueStatuses.OPEN,
    status_updated_at: new Date(),
    created_at: new Date(),
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
    author: "Fredkiss3",
    labels: [
      {
        id: 4,
        color: "#bfdec3",
        name: "template: documentation",
      },
    ],
    noOfComments: 0,
    status: IssueStatuses.OPEN,
    status_updated_at: new Date(),
    created_at: new Date(),
    assigned_to: [],
  },
  {
    id: 2,
    title:
      "[NEXT-1160] Clicking Links in intercepted routes does not unmount the interceptor route",
    author: "Fredkiss3",
    assigned_to: [],
    labels: [
      {
        id: 3,
        color: "#fddf99",
        name: "template: bug",
        description: "A user has filled out the bug report template",
      },
      {
        id: 4,
        color: "#bfdec3",
        name: "template: documentation",
      },
    ],
    noOfComments: 3,
    status: IssueStatuses.CLOSED,
    status_updated_at: new Date(),
    created_at: new Date(),
  },
  {
    id: 3,
    title:
      "[NEXT-1160] Clicking Links in intercepted routes does not unmount the interceptor route",
    author: "Fredkiss3",
    assigned_to: [
      {
        username: "shadcn",
        avatar_url: "https://avatars.githubusercontent.com/u/124599?v=4",
      },
      {
        username: "QuiiBz",
        avatar_url: "https://avatars.githubusercontent.com/u/43268759?v=4",
      },
    ],
    labels: [
      {
        id: 1,
        color: "#d5a7fa",
        name: "linear: next",
        description: "tracked issue",
      },
      {
        id: 2,
        color: "#c38eb0",
        name: "area: app",
        description: "app directory (appDir: true)",
      },
      {
        id: 3,
        color: "#fddf99",
        name: "template: bug",
        description: "A user has filled out the bug report template",
      },
    ],
    noOfComments: 1,
    status: IssueStatuses.NOT_PLANNED,
    status_updated_at: new Date(),
    created_at: new Date(),
  },
];

export async function getIssueList() {
  return issues;
}
