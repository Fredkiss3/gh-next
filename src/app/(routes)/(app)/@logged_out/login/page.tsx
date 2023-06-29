// components
import { MarkGithubIcon } from "@primer/octicons-react";
import { Button } from "~/app/(components)/button";
import { Card } from "~/app/(components)/card";

// utils
import { authenticateWithGithub } from "~/app/(actions)/auth";

export default function LoginPage() {
  return (
    <>
      <main className="w-full flex flex-col gap-4 justify-center items-center p-8">
        <h1 className="text-3xl">Sign in</h1>
        <Card className="inline-flex">
          <form action={authenticateWithGithub}>
            <Button variant="secondary">
              <MarkGithubIcon className="h-4 w-4" />
              <span>Login with GitHub</span>
            </Button>
          </form>
        </Card>
      </main>
    </>
  );
}
