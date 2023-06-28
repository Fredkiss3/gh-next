import { db } from "~/lib/db";
import { Button } from "~/app/(components)/button";
import { Input } from "~/app/(components)/input";
import { Card } from "~/app/(components)/card";

export const revalidate = 0;

export default async function Home() {
  return (
    <main className="p-5">
      <h1 className="text-4xl">Hello there</h1>

      <Card className="inline-flex">
        <form className="flex flex-col gap-2 max-w-[20rem]">
          <Input
            name="login"
            label="Email address"
            helpText='Visible in email as the "author"'
            required
            placeholder="hello@fredkiss.dev"
            defaultValue={"coucou@"}
            disabled
          />

          <Input
            name="password"
            label="Your password"
            required
            type="password"
          />

          <Button>button</Button>
        </form>
      </Card>
    </main>
  );
}
