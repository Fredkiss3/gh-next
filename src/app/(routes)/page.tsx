import { db } from "~/lib/db";
import { Button } from "~/app/(components)/button";

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

      <div className="flex gap-2">
        <Button variant="primary">button</Button>
        <Button variant="danger">button</Button>
        <Button variant="invisible">button</Button>
        <Button variant="outline">button</Button>
      </div>
    </main>
  );
}
