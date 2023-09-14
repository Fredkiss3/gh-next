"use client";
import * as React from "react";
// components
import Link from "next/link";
import { Input } from "~/app/(components)/input";
import {
  ActionList,
  type ActionListItem
} from "~/app/(components)/action-list";
import { CheckIcon } from "@primer/octicons-react";
import { IssueSearchLink } from "./issue-search-link";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { useMediaQuery } from "~/lib/client/hooks/use-media-query";
import { useIssueLabelListByNameQuery } from "~/lib/client/hooks/use-issue-label-list-query";
import { useSearchQueryStore } from "~/lib/client/hooks/issue-search-query-store";

// types
import type { Label } from "~/lib/server/db/schema/label.sql";
export type IssueLabelFilterActionListProps = {
  children: React.ReactNode;
};

export function IssueLabelFilterActionList({
  children
}: IssueLabelFilterActionListProps) {
  const [inputQuery, setInputQuery] = React.useState("");
  const alignRight = useMediaQuery(`(min-width: 768px)`);

  const getParsedQuery = useSearchQueryStore((store) => store.getParsedQuery);
  const currentLabels = getParsedQuery().label ?? [];
  const noLabel = !!getParsedQuery().no?.has("label");

  const { data: labels } = useIssueLabelListByNameQuery({
    name: inputQuery
  });

  const labelList: Array<ActionListItem<Label | Partial<Label>>> = [
    { name: "Unlabeled", selected: noLabel },
    ...(labels ?? []).map((label) => ({
      ...label,
      selected: currentLabels?.includes(label.name)
    }))
  ];

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
        let labelFilters: string[] = [];

        if (name) {
          if (currentLabels.includes(name)) {
            labelFilters = currentLabels.filter((label) => label !== name);
          } else {
            labelFilters = [...currentLabels, name];
          }
        }

        return (
          <IssueSearchLink
            filters={
              id
                ? {
                    label: labelFilters
                  }
                : {
                    no: new Set(["label"])
                  }
            }
            className={clsx(
              className,
              "inline-flex items-start gap-4 hover:bg-neutral/50 whitespace-nowrap w-full"
            )}
            onClick={onCloseList}
          >
            <div className="flex h-6 w-6 flex-shrink-0 items-start justify-center px-2">
              {selected && <CheckIcon className="h-5 w-5 flex-shrink-0" />}
            </div>

            {color && (
              <div
                className="h-4 w-4 rounded-full flex-shrink-0"
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
