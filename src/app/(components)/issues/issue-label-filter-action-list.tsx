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
import type { Label } from "~/lib/server/db/schema/label.sql";
import { title } from "process";

// types
export type IssueLabelFilterActionListProps = {
  children: React.ReactNode;
};

export function IssueLabelFilterActionList({
  children
}: IssueLabelFilterActionListProps) {
  const [inputQuery, setInputQuery] = React.useState("");
  const alignRight = useMediaQuery(`(min-width: 768px)`);

  const getParsedQuery = useSearchQueryStore((store) => store.getParsedQuery);
  const currentLabels = getParsedQuery().label;
  const noLabel = !!getParsedQuery().no?.has("label");

  const { data: labels } = useIssueLabelListByNameQuery({
    name: inputQuery
  });

  const labelList: Array<ActionListItem<Label | Partial<Label>>> = [
    { name: "Unlabelled", selected: noLabel },
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
          if (currentLabels && !currentLabels.includes(name)) {
            labelFilters = [...currentLabels, name];
          } else if (currentLabels && currentLabels.includes(name)) {
            labelFilters = currentLabels.filter((label) => label !== name);
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
              "flex items-center gap-4 hover:bg-neutral/50"
            )}
            onClick={onCloseList}
          >
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center px-2">
              {selected && <CheckIcon className="h-5 w-5 flex-shrink-0" />}
            </div>

            <div className="flex items-baseline gap-2">
              {color && (
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}

              <div className="flex flex-col gap-2">
                <strong className="font-semibold">{name}</strong>
                {description && <p className="text-grey">{description}</p>}
              </div>
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
