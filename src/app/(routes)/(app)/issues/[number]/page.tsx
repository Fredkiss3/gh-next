import "server-only";

// utils
import { db } from "~/lib/server/db/index.server";
import { cache } from "react";
import { issues } from "~/lib/server/db/schema/issue.sql";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

// types
import type { Metadata } from "next";
import type { PageProps } from "~/lib/types";
import { MarkdownTitle } from "~/app/(components)/markdown/markdown-title";
import { MarkdownContent } from "~/app/(components)/markdown/markdown-content";
import { preprocess, z } from "zod";
import { LabelBadge } from "~/app/(components)/label-badge";

const getIssueDetail = cache(async function getIssueDetail(number: number) {
  return await db.select().from(issues).where(eq(issues.number, number));
});

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
        {/* <h2>
          <LabelBadge title="CODE" color="#00F" className="text-2xl" />
        </h2>
        <pre className="bg-neutral my-8 p-5 overflow-x-auto rounded-md">
          {issue.body}
        </pre>

        <h2>
          <LabelBadge title="RENDER RESULT" color="#F00" className="text-2xl" />
        </h2> */}
        {/* <MarkdownContent content={issue.body.replace(/```/g, "~~~")} /> */}
        <MarkdownContent
          content={`
## HTML :

<img src="https://http.cat/418" alt="I'm a teapot">

~~~code~~~

<details>

<summary>Summary</summary>

~strike~

~~~js
console.log('It works!')
~~~
## LINK :
www.nasa.gov.

## MARKDOWN :
![I'm a teapot](https://http.cat/418)
</details>        `}
        />
      </section>
    </div>
  );
}
