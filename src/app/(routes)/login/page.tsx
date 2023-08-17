// components
import { MarkGithubIcon } from "@primer/octicons-react";
import { Button } from "~/app/(components)/button";
import { Card } from "~/app/(components)/card";
import Link from "next/link";

// utils
import { authenticateWithGithub } from "~/app/(actions)/auth";

// types
import type { PageProps } from "~/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage({
  searchParams,
}: PageProps<{}, { nextUrl: string }>) {
  const nextUrl = searchParams?.nextUrl;

  return (
    <>
      <main className="w-full flex flex-col gap-4 justify-center items-center p-8">
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <Card className="inline-flex">
          <form action={authenticateWithGithub}>
            <input type="hidden" name="_nextUrl" value={nextUrl} />
            <Button variant="secondary" type="submit">
              <MarkGithubIcon className="h-4 w-4" />
              <span>Login with GitHub</span>
            </Button>
          </form>
        </Card>
      </main>

      <div className="flex items-center text-grey gap-4 justify-center">
        <Link href="/">
          <MarkGithubIcon className="h-8 w-8" />
        </Link>
        <span>
          &copy; {new Date().getFullYear()} Design from Github, Inc. Code
          by&nbsp;
          <a
            href="https://fredkiss.dev"
            target="_blank"
            className="text-accent"
          >
            Fredkiss3
          </a>
          &nbsp;&middot;&nbsp;
          <a
            href="https://github.com/Fredkiss3/gh-next"
            target="_blank"
            className="text-accent"
          >
            source code
          </a>
        </span>
      </div>
    </>
  );
}
