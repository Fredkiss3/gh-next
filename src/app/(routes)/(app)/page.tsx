// components
import {
  EyeIcon,
  ListUnorderedIcon,
  PinIcon,
  RepoForkedIcon,
  StarFillIcon,
  StarIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import { Avatar } from "~/app/(components)/avatar";
import { Badge } from "~/app/(components)/badge";
import { CounterBadge } from "~/app/(components)/counter-badge";
import { Button } from "~/app/(components)/button";

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
    <div className="flex flex-col gap-4">
      <section
        id="repository-header"
        className="pb-6 border-b border-neutral flex items-center justify-between"
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
              <PinIcon className={clsx(cls, "text-grey -scale-x-100")} />
            )}
          >
            Pin
          </Button>
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

      <ReadmeContent />
    </div>
  );
}

function ReadmeContent() {
  return (
    <div className="rounded-md border border-neutral">
      <div className="border-b border-neutral flex items-center gap-2 p-4">
        <button className="flex items-center justify-center p-2 rounded-md hover:bg-neutral/50">
          <ListUnorderedIcon className="h-4 w-4 text-grey" />
        </button>
        <h2 className="font-semibold text-base">README.md</h2>
      </div>
      <article className="p-4">
        <h3 className="text-2xl font-bold">Let me cook...</h3>
        <p className="my-6 text-lg">
          The labels on the buttons aboves (watch, fork, star) are refetched
          every 30 mins, why not give a star&nbsp;
          <a
            href="https://github.com/Fredkiss3/gh-next"
            className="text-accent"
          >
            to the original repo ?
          </a>
        </p>
      </article>
    </div>
  );
}
