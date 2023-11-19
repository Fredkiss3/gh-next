import "server-only";

// components
import { MarkdownTitle } from "~/app/(components)/markdown/markdown-title";
import { Markdown } from "~/app/(components)/markdown";

// utils
import { notFound } from "next/navigation";
import { preprocess, z } from "zod";
import { getIssueDetail } from "~/app/(actions)/issue";

// types
import type { Metadata } from "next";
import type { PageProps } from "~/lib/types";

export async function generateMetadata({
  params
}: PageProps<{ number: string }>): Promise<Metadata> {
  const issueNumberResult = preprocess(
    (arg) => Number(arg),
    z.number()
  ).safeParse(params.number);

  if (!issueNumberResult.success) {
    notFound();
  }

  const [issue] = await getIssueDetail(issueNumberResult.data);

  if (!issue) {
    notFound();
  }

  return {
    title: `${issue.title} · Issue #${params.number}`
  };
}

export default async function IssueDetailPage({
  params
}: PageProps<{ number: string }>) {
  const [issue] = await getIssueDetail(Number(params.number));

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
        {/* <Markdown content={issue.body} /> */}
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
*   Mention: @fredkiss3, @BeardedBear, @alvarlagerlof, @twidi
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
      </section>
    </div>
  );
}
