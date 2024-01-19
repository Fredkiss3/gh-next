import "server-only";

// components
import { MarkdownTitle } from "~/components/markdown/markdown-title";
import { Markdown } from "~/components/markdown/markdown";
import { Cache } from "~/components/cache";

// utils
import { notFound } from "next/navigation";
import { preprocess, z } from "zod";
import { CacheKeys } from "~/lib/shared/cache-keys.shared";
import { getSingleIssue } from "~/models/issues";

// types
import type { Metadata } from "next";
import type { PageProps } from "~/lib/types";

type IssueDetailPageProps = PageProps<{
  user: string;
  repository: string;
  number: string;
}>;

const issueParamsSchema = z.object({
  number: preprocess((arg) => Number(arg), z.number()),
  user: z.string().min(1),
  repository: z.string().min(1)
});

export async function generateMetadata({
  params
}: IssueDetailPageProps): Promise<Metadata> {
  const paramsResult = issueParamsSchema.safeParse(params);

  if (!paramsResult.success) {
    notFound();
  }

  const issue = await getSingleIssue(
    paramsResult.data.user,
    paramsResult.data.repository,
    paramsResult.data.number
  );

  if (!issue) {
    notFound();
  }

  return {
    title: `${issue.title} · Issue #${params.number}`
  };
}

export default async function IssueDetailPage({
  params
}: IssueDetailPageProps) {
  const paramsResult = issueParamsSchema.safeParse(params);

  if (!paramsResult.success) {
    notFound();
  }

  const user = paramsResult.data.user;
  const repo = paramsResult.data.repository;
  const issueNo = paramsResult.data.number;

  const issue = await getSingleIssue(user, repo, issueNo);
  if (!issue) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="px-5 border-b border-neutral py-5">
        <h1 className="flex gap-3 flex-wrap text-3xl">
          <bdi>
            <MarkdownTitle title={issue.title} />
          </bdi>
          <span className="text-grey">#{issue.number}</span>
        </h1>
      </section>

      <section className="px-5 flex flex-col gap-5">
        {/* <Cache
          debugLogs
          id={CacheKeys.issues({
            user: params.user,
            repo: params.repository,
            number: issueNo,
            updatedAt: issue.updated_at
          })}
        > */}
        <Markdown content={issue.body} />
        {/* </Cache> */}
        {/* <Cache id={"issue-test"} bypassInDEV>
          <Markdown
            content={`
## Some references:

*   Commit: f8083175fe890cbf14f41d0a06e7aa35d4989587
*   Commit (fork): foo@f8083175fe890cbf14f41d0a06e7aa35d4989587
*   Commit (repo): remarkjs/remark@e1aa9f6c02de18b9459b7d269712bcb50183ce89
*   Issue or PR (\`#\`): #48748
*   Issue or PR (\`GH-\`): GH-42991
*   Issue or PR (fork): foo#1
*   Issue or PR (project): remarkjs/remark#1
*   Mention: @fredkiss3, @BeardedBear, @alvarlagerlof, @fredk3
*   Issue or PR (link) : https://gh.fredkiss.dev/Fredkiss3/gh-next/issues/42991
- feat: support excluded paths by @fredkiss3 in #25
- fix(multiple-dependency-versions): increase versions padding by @fredkiss3 in #26
- feat: new non-existant-packages rule by @fredkiss3 in #27
- fix(types-in-dependencies): autofix when package doesn't have devDependencies by @fredkiss3 in #28
- fix(multiple-dependency-versions): improve formatting for single packages by @fredkiss3 in #29
- feat: autofix non-existant-packages by @fredkiss3 in #30
- feat: autofix packages-without-package-json by @fredkiss3 in #31
`}
          />
        </Cache> */}
      </section>
    </div>
  );
}
