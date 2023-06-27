import { db } from "~/lib/db";
import { Button } from "../(components)/button";

export const revalidate = 0;

export default async function Home() {
  const users = await db.query.users.findMany({});

  return (
    <main className="p-5">
      <h1 className="text-4xl">Hello there</h1>

      <div>
        {users.map((u) => (
          <ul key={u.id}>(-) {u.username}</ul>
        ))}
      </div>

      <Button variant="invisible">button</Button>
      <Button variant="outline">button</Button>
    </main>
  );
}
