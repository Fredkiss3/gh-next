import * as React from "react";
import { HeaderNavLinks } from "~/components/header/header-navlinks";

import type { PageProps } from "~/lib/types";

export default function RepositoryHeaderSubnav({
  params
}: PageProps<{
  user: string;
  repository: string;
}>) {
  return <HeaderNavLinks params={params} />;
}
