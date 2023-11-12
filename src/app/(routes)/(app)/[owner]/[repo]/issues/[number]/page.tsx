import "server-only";

// components
import { MarkdownTitle } from "~/app/(components)/markdown/markdown-title";
import { MarkdownContent } from "~/app/(components)/markdown/markdown-content";

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
        <MarkdownContent content={issue.body} />
        <MarkdownContent
          content={`Some references:

*   Commit: f8083175fe890cbf14f41d0a06e7aa35d4989587
*   Commit (fork): foo@f8083175fe890cbf14f41d0a06e7aa35d4989587
*   Commit (repo): remarkjs/remark@e1aa9f6c02de18b9459b7d269712bcb50183ce89
*   Issue or PR (\`#\`): #48748
*   Issue or PR (\`GH-\`): GH-42991
*   Issue or PR (fork): foo#1
*   Issue or PR (project): remarkjs/remark#1
*   Mention: @fredkiss3, @everx80, @woooorm, @crazymeal

Some links:

*   Commit: https://github.com/remarkjs/remark/commit/e1aa9f6c02de18b9459b7d269712bcb50183ce89
*   Commit comment: https://github.com/remarkjs/remark/commit/ac63bc3abacf14cf08ca5e2d8f1f8e88a7b9015c#commitcomment-16372693
*   Issue or PR: https://github.com/remarkjs/remark/issues/182
*   Issue or PR comment: https://github.com/remarkjs/remark-github/issues/3#issue-151160339
*   Mention: https://github.com/ben-eb
`}
        />
      </section>
    </div>
  );
}
