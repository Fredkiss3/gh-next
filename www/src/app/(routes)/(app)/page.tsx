// components
import {
  BookIcon,
  DotFillIcon,
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
import Link from "next/link";

// utils
import { getSession } from "~/app/(actions)/auth";
import { getGithubRepoData } from "~/app/(actions)/github";
import {
  AUTHOR_AVATAR_URL,
  GITHUB_AUTHOR_USERNAME,
  GITHUB_REPOSITORY_NAME,
} from "~/lib/constants";
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
          "md:flex",
          "xl:px-0 xl:mx-8"
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
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`}
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
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/fork`}
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
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`}
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
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`}
            variant="ghost"
            isSquared
            renderLeadingIcon={(cls) => (
              <EyeIcon className={clsx(cls, "text-foreground")} />
            )}
          >
            <span className="sr-only">Watch</span>
          </Button>
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/fork`}
            variant="ghost"
            isSquared
            renderLeadingIcon={(cls) => (
              <RepoForkedIcon className={clsx(cls, "text-foreground")} />
            )}
          >
            <span className="sr-only">Fork</span>
          </Button>
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`}
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
          <li>
            <a
              className="text-grey flex items-center gap-2 hover:text-accent group"
              href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/stargazers`}
            >
              <StarIcon className="h-4 w-4" />
              <div>
                <strong className="text-foreground group-hover:text-accent">
                  {repositoryData.stargazerCount}
                </strong>
                &nbsp;
                <span>stars</span>
              </div>
            </a>
          </li>
          <li>
            <a
              className="text-grey flex items-center gap-2 hover:text-accent group"
              href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/forks`}
            >
              <RepoForkedIcon className="h-4 w-4" />
              <div>
                <strong className="text-foreground group-hover:text-accent">
                  {repositoryData.forkCount}
                </strong>
                &nbsp;
                <span>fork</span>
              </div>
            </a>
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
          <li>
            <a
              className="text-grey flex items-center gap-2 hover:text-accent group"
              href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/pulse`}
            >
              <PulseIcon className="h-4 w-4" />
              <span>Activity</span>
            </a>
          </li>
        </ul>

        <div className="flex gap-2 items-center text-grey">
          <GlobeIcon className="h-4 w-4" />
          <span>Pulic repository</span>
        </div>
      </section>

      <section
        id="body"
        className={clsx(
          "md:grid items-start gap-4",
          "sm:px-5",
          "md:grid-cols-11 md:px-8",
          "lg:grid-cols-[repeat(13,_minmax(0,_1fr))]",
          "xl:grid-cols-[repeat(15,_minmax(0,_1fr))]"
        )}
      >
        <ReadmeContent className="md:col-span-7 lg:col-span-9 xl:col-span-11 w-full" />

        <aside
          className={clsx(
            "hidden col-span-4 flex-col gap-6 sticky top-4",
            "md:flex"
          )}
        >
          <div className="flex flex-col items-start gap-5 border-neutral pb-6 border-b">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="text-lg">{repositoryData.description}</p>

            <div className="flex gap-3 items-center">
              <LinkIcon className="h-4 w-4" />
              <a
                href={repositoryData.url}
                target="_blank"
                className="text-accent font-semibold"
              >
                {repositoryData.url}
              </a>
            </div>

            <ul className="flex flex-col items-start gap-3">
              <li>
                <a
                  href="#readme"
                  className="text-grey flex items-center gap-3 hover:text-accent"
                >
                  <BookIcon className="h-4 w-4" />
                  <span>Readme</span>
                </a>
              </li>

              <li>
                <a
                  href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/pulse`}
                  className="text-grey flex items-center gap-3 hover:text-accent"
                >
                  <PulseIcon className="h-4 w-4" />
                  <span>Activity</span>
                </a>
              </li>

              <li>
                <a
                  href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/stargazers`}
                  className="text-grey flex items-center gap-3 hover:text-accent"
                >
                  <StarIcon className="h-4 w-4" />

                  <div>
                    <strong>{repositoryData.stargazerCount}</strong>
                    &nbsp;
                    <span>stars</span>
                  </div>
                </a>
              </li>

              <li className="text-grey flex items-center gap-3">
                <EyeIcon className="h-4 w-4" />
                <div>
                  <strong>{repositoryData.watcherCount}</strong>
                  &nbsp;
                  <span>watching</span>
                </div>
              </li>

              <li className="text-grey flex items-center gap-3">
                <a
                  href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/forks`}
                  className="text-grey flex items-center gap-3 hover:text-accent"
                >
                  <RepoForkedIcon className="h-4 w-4" />
                  <div>
                    <strong>{repositoryData.forkCount}</strong>
                    &nbsp;
                    <span>fork</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-start pb-6">
            <h2 className="text-lg font-semibold mb-5">Languages</h2>
            <div className="flex rounded-md h-2 w-full mb-3">
              {repositoryData.languages.map((lang, index) => (
                <div
                  className={clsx("h-full", {
                    "rounded-l-md": index === 0,
                    "rounded-r-md":
                      index === repositoryData.languages.length - 1,
                    "border-l-2 border-neutral": index !== 0,
                  })}
                  style={{
                    backgroundColor: lang.color,
                    width: `${lang.percent}%`,
                  }}
                  key={lang.name}
                />
              ))}
            </div>

            <ul className="flex flex-wrap items-start gap-2">
              {repositoryData.languages.map((lang) => (
                <li key={lang.color} className="flex items-center gap-1">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      color: lang.color,
                    }}
                  >
                    <DotFillIcon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">{lang.name}</span>
                  <span className="text-grey">{lang.percent}%</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

async function ReadmeContent({ className }: { className?: string }) {
  const { readmeContent } = await getGithubRepoData();

  return (
    <div className={className}>
      <div
        className={clsx(
          "border border-neutral flex items-center gap-2 p-4",
          "sticky -top-1 bg-backdrop z-10",
          "sm:rounded-t-md"
        )}
      >
        <button className="flex items-center justify-center p-2 rounded-md hover:bg-neutral/50">
          <ListUnorderedIcon className="h-4 w-4 text-grey" />
        </button>
        <h2
          className="font-semibold text-base scroll-mt-10 hover:text-accent hover:underline"
          id="readme"
        >
          <Link href="#readme">README.md</Link>
        </h2>
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
          className="px-8 pb-8 pt-4 w-full max-w-full"
        />
      </div>
    </div>
  );
}
