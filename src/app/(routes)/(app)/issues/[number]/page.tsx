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
      </section>
    </div>
  );
}
