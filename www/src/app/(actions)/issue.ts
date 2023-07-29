"use server";

const authorList = [
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
      item.username.toLowerCase().startsWith(name.toLowerCase()) ||
      item.name.toLowerCase().includes(name.toLowerCase())
  );
}
