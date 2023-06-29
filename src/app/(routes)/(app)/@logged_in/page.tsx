import { destroySession, getUser } from "~/app/(actions)/auth";
import { Button } from "~/app/(components)/button";

export default async function Default() {
  // do not try to call getTodos if session is null because wether the page is rendered or not
  // in the Layout, the page will be called

  const user = await getUser();
  if (!user) {
    return null;
  }

  return (
    <>
      <h1 className="text-4xl">LOGGED IN</h1>

      <pre>{JSON.stringify(user)}</pre>

      <form action={destroySession}>
        <Button variant="danger">Logout</Button>
      </form>
    </>
  );
}
