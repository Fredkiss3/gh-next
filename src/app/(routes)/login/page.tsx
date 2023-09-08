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
  title: "Login"
};

export default function LoginPage({
  searchParams
}: PageProps<{}, { nextUrl: string }>) {
  const nextUrl = searchParams?.nextUrl;

  return (
    <>
      <main className="flex w-full flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <Card className="flex max-w-[400px] flex-col gap-8">
          <div>
            <h2 className="mb-4 text-lg font-medium">
              We collect these <span className="underline">public</span>&nbsp;
              informations when you login :
            </h2>
            <ul className="">
              <li>
                <span className="font-semibold underline">username :</span> used
                to identify you by your username inside issues
              </li>
              <li>
                <span className="font-semibold underline">avatar_url :</span>
                &nbsp; used to automatically give you a default avatar
              </li>
              <li>
                <span className="font-semibold underline">github_id :</span>
                &nbsp; to automatically create or associate to your account when
                you log in
              </li>
              <li>
                <span className="font-semibold underline">name :</span>&nbsp;
                displayed in your profile
              </li>
              <li>
                <span className="font-semibold underline">bio :</span> displayed
                in your profile
              </li>
              <li>
                <span className="font-semibold underline">location :</span>
                &nbsp; displayed in your profile
              </li>
            </ul>
          </div>
          <form
            action={authenticateWithGithub}
            className="flex w-full flex-col items-center"
          >
            <input type="hidden" name="_nextUrl" value={nextUrl} />
            <Button variant="primary" type="submit" isBlock>
              <MarkGithubIcon className="h-4 w-4" />
              <span>Login with GitHub</span>
            </Button>
          </form>
        </Card>
      </main>

      <div className="flex items-center justify-center gap-4 text-grey">
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
