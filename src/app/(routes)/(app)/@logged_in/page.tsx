import { logoutUser, getSession } from "~/app/(actions)/auth";
import { Button } from "~/app/(components)/button";

export default async function Default() {
  const session = await getSession();

  return (
    <>
      <h1 className="text-4xl">LOGGED IN</h1>

      <pre>
        {JSON.stringify(
          {
            user: session.user,
          },
          null,
          2
        )}
      </pre>

      <form action={logoutUser}>
        <Button variant="danger">Logout</Button>
      </form>
    </>
  );
}
