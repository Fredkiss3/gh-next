// components
import { NewIssueForm } from "~/app/(components)/issues/new-issue-form";

// utils
import { notFound } from "next/navigation";
import { getUserOrRedirect } from "~/app/(actions)/auth";
import { getRepositoryByOwnerAndName } from "~/app/(models)/repository";

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
  const repository = await getRepositoryByOwnerAndName(
    props.params.user,
    props.params.repository
  );

  if (!repository) {
    notFound();
  }

  const currentUser = await getUserOrRedirect(
    `/${props.params.user}/${props.params.repository}/issues/new`
  );
  return (
    <NewIssueForm
      currentUserAvatarUrl={currentUser.username}
      currentUserUsername={currentUser.avatar_url}
    />
  );
}
