import * as React from "react";

// components
import { MarkGithubIcon } from "@primer/octicons-react";
import Link from "next/link";

// utils
import { clsx } from "~/lib/functions";

export type FooterProps = {};

export async function Footer({}: FooterProps) {
  return (
    <footer
      className={clsx("max-w-[1200px] mx-auto border-t border-neutral py-6")}
    >
      <h2 className="sr-only">Footer</h2>
      <div className="flex items-center text-grey gap-4">
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
    </footer>
  );
}
