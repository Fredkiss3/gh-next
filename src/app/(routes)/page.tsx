import { db } from "~/lib/db";
import { userTable } from "~/lib/db/schema";

export default async function Home() {
  const users = await db.select().from(userTable).all();
  return (
    <main className="p-5">
      <h1 className="text-4xl">Hello there</h1>

      <ul>
        {users.map((u) => (
          <li key={u.id}>(-) {u.username}</li>
        ))}
      </ul>
    </main>
  );
}
