import { db } from "~/lib/db";

export const revalidate = 0;

export default async function Home() {
  const users = await db.query.users.findMany({
    with: {
      createdIssues: {
        with: {
          reactions: {
            columns: {
              id: true,
              type: true,
            },
            with: {
              author: {
                columns: {
                  username: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return (
    <main className="p-5">
      <h1 className="text-4xl">Hello there</h1>

      <div>
        {users.map((u) => (
          <ul key={u.id}>
            (-) {u.username}
            {u.createdIssues.map((i) => {
              return (
                <li key={i.id}>
                  {i.status} - {i.title} - {i.created_at.toISOString()}
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </main>
  );
}
