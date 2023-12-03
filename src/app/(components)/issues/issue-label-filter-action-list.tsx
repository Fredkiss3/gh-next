"use client";
import * as React from "react";
// components
import { Input } from "~/app/(components)/input";
import { ActionList } from "~/app/(components)/action-list";
import { CheckIcon } from "@primer/octicons-react";
import { IssueSearchLink } from "./issue-search-link";

// utils
import { clsx, parseIssueFilterTokens } from "~/lib/shared/utils.shared";
import { useMediaQuery } from "~/lib/client/hooks/use-media-query";
import { useIssueLabelListByNameQuery } from "./use-issue-label-list-query";
import { useSearchParams } from "next/navigation";
import { DEFAULT_ISSUE_SEARCH_QUERY } from "~/lib/shared/constants";

// types
export type IssueLabelFilterActionListProps = {
  children: React.ReactNode;
};

export function IssueLabelFilterActionList({
  children
}: IssueLabelFilterActionListProps) {
  const [inputQuery, setInputQuery] = React.useState("");
  const alignRight = useMediaQuery(`(min-width: 768px)`);

  const searchParams = useSearchParams();
  const allFilters = parseIssueFilterTokens(
    searchParams.get("q") ?? DEFAULT_ISSUE_SEARCH_QUERY
  );

  const currentLabels = allFilters.label ?? [];
  const noLabel = !!allFilters.no?.includes("label");

  const { data: labels } = useIssueLabelListByNameQuery({
    name: inputQuery
  });

  const labelList = React.useMemo(() => {
    return [
      {
        name: "Unlabeled",
        selected: noLabel,
        color: undefined,
        description: undefined
      },
      ...(labels ?? []).map((label) => ({
        ...label,
        selected: allFilters.label?.includes(label.name)
      }))
    ];
  }, [allFilters.label, labels, noLabel]);

  return (
    <ActionList
      items={[
        {
          items: labelList
        }
      ]}
      renderItem={({
        selected,
        className,
        color,
        name,
        description,
        id,
        onCloseList
      }) => {
        const newFilters = { ...allFilters };
        if (!id && !selected) {
          if (newFilters.no) {
            newFilters.no = [...newFilters.no, "label"];
          } else {
            newFilters.no = ["label"];
          }
          newFilters.label = null; // remove label filter
        } else {
          newFilters.no = (newFilters.no ?? [])?.filter(
            (item) => item !== "label"
          ); // don't keep the 'no:label' filter

          if (id) {
            if (currentLabels.includes(name)) {
              newFilters.label = currentLabels.filter(
                (label) => label !== name
              );
            } else {
              newFilters.label = [...currentLabels, name];
            }
          }
        }

        return (
          <IssueSearchLink
            filters={newFilters}
            className={clsx(
              className,
              "inline-flex items-start gap-3 whitespace-nowrap w-full text-xs",
              "hover:bg-neutral/50"
            )}
            onClick={onCloseList}
          >
            <div className="flex h-6 w-6 flex-shrink-0 items-start justify-center px-2">
              {selected && <CheckIcon className="h-4 w-4 flex-shrink-0" />}
            </div>

            {color && (
              <div
                className="h-3.5 w-3.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
            )}

            <div className="min-w-0 box-border">
              <strong className="font-semibold truncate mb-2">{name}</strong>
              {description && (
                <div className="text-grey truncate font-medium">
                  {description}
                </div>
              )}
            </div>
          </IssueSearchLink>
        );
      }}
      align={alignRight ? "right" : "left"}
      title="Filter by label"
      header={
        <Input
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          label="Author name or username"
          hideLabel
          autoFocus
          placeholder="Filter users"
        />
      }
      footer={<>You can select more than one label </>}
    >
      {children}
    </ActionList>
  );
}
