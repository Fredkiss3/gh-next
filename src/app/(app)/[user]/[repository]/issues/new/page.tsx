// components
import { NewIssueForm } from "~/components/issues/new-issue-form";
import { Markdown } from "~/components/markdown/markdown";

// utils
import { notFound } from "next/navigation";
import { getUserOrRedirect } from "~/actions/auth.action";
import { getRepositoryByOwnerAndName } from "~/models/repository";

// types
import type { Metadata } from "next";
import type { PageProps } from "~/lib/types";

type NewIssuePageProps = PageProps<{
  user: string;
  repository: string;
}>;

export const metadata: Metadata = {
  title: "New Issue"
};

export default async function NewIssuePage(props: NewIssuePageProps) {
  const [repository, currentUser] = await Promise.all([
    getRepositoryByOwnerAndName(props.params.user, props.params.repository),
    getUserOrRedirect(
      `/${props.params.user}/${props.params.repository}/issues/new`
    )
  ]);

  if (!repository) {
    notFound();
  }

  return (
    <NewIssueForm
      currentUserAvatarUrl={currentUser.avatar_url}
      currentUserUsername={currentUser.username}
      renderMarkdownAction={async (
        content: string,
        repositoryPath: `${string}/${string}`
      ) => {
        "use server";
        return <Markdown content={content} repository={repositoryPath} />;
      }}
    />
  );
}
