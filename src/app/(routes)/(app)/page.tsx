// components
import {
  EyeIcon,
  GlobeIcon,
  LinkIcon,
  ListUnorderedIcon,
  PulseIcon,
  RepoForkedIcon,
  StarFillIcon,
  StarIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import { Avatar } from "~/app/(components)/avatar";
import { Badge } from "~/app/(components)/badge";
import { CounterBadge } from "~/app/(components)/counter-badge";
import { Button } from "~/app/(components)/button";
import { MarkdownContent } from "~/app/(components)/markdown-content";

// utils
import { getSession } from "~/app/(actions)/auth";
import { getGithubRepoData } from "~/app/(actions)/github";
import { AUTHOR_AVATAR_URL, GITHUB_AUTHOR_USERNAME } from "~/lib/constants";
import { clsx } from "~/lib/functions";

export default async function Page() {
  const { user } = await getSession();
  const repositoryData = await getGithubRepoData();
  const hasStarred = user && repositoryData.stargazers.includes(user.username);

  return (
    <div className={clsx("flex flex-col", "sm:gap-4")}>
      <section
        id="repository-header-desktop"
        className={clsx(
          "pb-6 border-b border-neutral px-8",
          "hidden items-center justify-between flex-wrap",
          "md:flex"
        )}
      >
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          <Avatar
            username={GITHUB_AUTHOR_USERNAME}
            src={AUTHOR_AVATAR_URL}
            size="small"
          />
          <span>gh-next</span>

          <Badge label="Public" />
        </h1>

        <div className="flex items-center gap-3">
          <Button
            href="https://github.com/Fredkiss3/gh-next"
            variant="ghost"
            renderLeadingIcon={(cls) => (
              <EyeIcon className={clsx(cls, "text-grey")} />
            )}
            renderTrailingIcon={(cls) => (
              <TriangleDownIcon className={clsx(cls, "text-grey")} />
            )}
          >
            Watch
            <CounterBadge count={repositoryData.watcherCount} />
          </Button>
          <Button
            href="https://github.com/Fredkiss3/gh-next/fork"
            variant="ghost"
            renderLeadingIcon={(cls) => (
              <RepoForkedIcon className={clsx(cls, "text-grey")} />
            )}
            renderTrailingIcon={(cls) => (
              <TriangleDownIcon className={clsx(cls, "text-grey")} />
            )}
          >
            Fork
            <CounterBadge count={repositoryData.forkCount} />
          </Button>
          <Button
            href="https://github.com/Fredkiss3/gh-next"
            variant="ghost"
            renderLeadingIcon={(cls) =>
              hasStarred ? (
                <StarFillIcon className={clsx(cls, "text-yellow-500")} />
              ) : (
                <StarIcon className={clsx(cls, "text-grey")} />
              )
            }
            renderTrailingIcon={(cls) => (
              <TriangleDownIcon className={clsx(cls, "text-grey")} />
            )}
          >
            <span>{hasStarred ? "Starred" : "Star"}</span>
            <CounterBadge count={repositoryData.stargazerCount} />
          </Button>
        </div>
      </section>

      <section
        id="repository-header-mobile"
        className={clsx(
          "pb-6 px-5",
          "flex flex-col items-start gap-5 border-neutral",
          "sm:border-b",
          "md:hidden"
        )}
      >
        <div className="flex items-center gap-2">
          <Button
            href="https://github.com/Fredkiss3/gh-next"
            variant="ghost"
            isSquared
            renderLeadingIcon={(cls) => (
              <EyeIcon className={clsx(cls, "text-foreground")} />
            )}
          >
            <span className="sr-only">Watch</span>
          </Button>
          <Button
            href="https://github.com/Fredkiss3/gh-next/fork"
            variant="ghost"
            isSquared
            renderLeadingIcon={(cls) => (
              <RepoForkedIcon className={clsx(cls, "text-foreground")} />
            )}
          >
            <span className="sr-only">Fork</span>
          </Button>
          <Button
            href="https://github.com/Fredkiss3/gh-next"
            variant="ghost"
            isSquared
            renderLeadingIcon={(cls) =>
              hasStarred ? (
                <StarFillIcon className={clsx(cls, "text-yellow-500")} />
              ) : (
                <StarIcon className={clsx(cls, "text-foreground")} />
              )
            }
          >
            <span className="sr-only">{hasStarred ? "Starred" : "Star"}</span>
          </Button>
        </div>

        <p className="text-grey text-lg">{repositoryData.description}</p>

        <div className="flex gap-2 items-center">
          <LinkIcon className="h-4 w-4 text-grey" />
          <a href={repositoryData.url} className="text-accent font-medium">
            {repositoryData.url}
          </a>
        </div>

        <ul className="flex items-center flex-wrap gap-4">
          <li className="text-grey flex items-center gap-2">
            <StarIcon className="h-4 w-4" />

            <div>
              <strong className="text-foreground">
                {repositoryData.stargazerCount}
              </strong>
              &nbsp;
              <span>stars</span>
            </div>
          </li>
          <li className="text-grey flex items-center gap-2">
            <RepoForkedIcon className="h-4 w-4" />
            <div>
              <strong className="text-foreground">
                {repositoryData.forkCount}
              </strong>
              &nbsp;
              <span>fork</span>
            </div>
          </li>
          <li className="text-grey flex items-center gap-2">
            <EyeIcon className="h-4 w-4" />
            <div>
              <strong className="text-foreground">
                {repositoryData.watcherCount}
              </strong>
              &nbsp;
              <span>watching</span>
            </div>
          </li>
          <li className="text-grey flex items-center gap-2">
            <PulseIcon className="h-4 w-4" />
            <span>Activity</span>
          </li>
        </ul>

        <div className="flex gap-2 items-center text-grey">
          <GlobeIcon className="h-4 w-4" />
          <span>Pulic repository</span>
        </div>
      </section>

      <ReadmeContent />
    </div>
  );
}

async function ReadmeContent() {
  const { readmeContent } = await getGithubRepoData();

  // TODO
  const tableExample = `
| Alpha | Bravo   |
| ----- | ------- |
| 中文  | Charlie |
| 👩‍❤️‍👩    | Delta   |
            `;

  return (
    <section className={clsx("sm:px-5", "md:px-8")}>
      <div
        className={clsx(
          "border border-neutral flex items-center gap-2 p-4",
          "sticky top-0 bg-backdrop z-10",
          "sm:rounded-t-md"
        )}
      >
        <button className="flex items-center justify-center p-2 rounded-md hover:bg-neutral/50">
          <ListUnorderedIcon className="h-4 w-4 text-grey" />
        </button>
        <h2 className="font-semibold text-base">README.md</h2>
      </div>

      <div
        className={clsx(
          "p-4 border-l border-r border-b border-neutral",
          "sm:rounded-b-md"
        )}
      >
        <MarkdownContent
          linkHeaders
          content={readmeContent}
          className="px-8 pb-8 pt-4"
        />
      </div>
    </section>
  );
}
