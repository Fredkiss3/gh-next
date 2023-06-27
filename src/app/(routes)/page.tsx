import { db } from "~/lib/db";
import { Button } from "~/app/(components)/button";
import { Input } from "~/app/(components)/input";
import { Textarea } from "~/app/(components)/textarea";

export const revalidate = 0;

export default async function Home() {
  return (
    <main className="p-5">
      <h1 className="text-4xl">Hello there</h1>

      <form className="flex flex-col gap-2 max-w-[20rem]">
        <Input
          name="login"
          label="Email address"
          helpText='Visible in email as the "author"'
          required
          placeholder="hello@fredkiss.dev"
          defaultValue={"coucou@"}
          validationStatus="error"
          validationText="this email is invalid"
        />

        <Textarea label="comment" name="comments" />
        <Button>button</Button>
      </form>
    </main>
  );
}
