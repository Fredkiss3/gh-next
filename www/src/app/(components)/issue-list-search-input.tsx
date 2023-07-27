import * as React from "react";
import { Input } from "./input";
import { useSearchParams } from "next/navigation";

export type IssueListSearchInputProps = {};

// TODO
// Inspiration : https://github.com/openstatusHQ/openstatus/blob/main/apps/web/src/app/_components/input-search.tsx
export function IssueListSearchInput({}: IssueListSearchInputProps) {
  const search = useSearchParams();

  return (
    <>
      <Input
        name="q"
        autoFocus
        type="text"
        defaultValue={search.get("q") ?? "is:open"}
        className="rounded-l-none flex-grow"
        placeholder="Search all issues"
        label="input your search"
        hideLabel
      />
    </>
  );
}
