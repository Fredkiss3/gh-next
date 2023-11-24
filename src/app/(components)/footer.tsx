import * as React from "react";

// components
import { MarkGithubIcon } from "@primer/octicons-react";
import Link from "next/link";

// utils
import { clsx } from "~/lib/shared/utils.shared";

export type FooterProps = {};

export async function Footer({}: FooterProps) {
  return (
    <footer
      className={clsx(
        "mx-auto max-w-[1270px] border-t border-neutral px-5 py-6 text-xs",
        "md:px-8"
      )}
    >
      <h2 className="sr-only">Footer</h2>
      <div className="flex items-center gap-4 text-grey">
        <Link href="/">
          <MarkGithubIcon className="h-6 w-6" />
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
