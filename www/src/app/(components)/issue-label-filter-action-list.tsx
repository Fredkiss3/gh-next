"use client";
import * as React from "react";
// components
import Link from "next/link";
import { Input } from "./input";
import { ActionList } from "./action-list";
import { CheckIcon } from "@primer/octicons-react";

// utils
import { clsx } from "~/lib/shared-utils";
import { useMediaQuery } from "~/lib/hooks/use-media-query";

// types
export type IssueLabelFilterActionListProps = {
  children: React.ReactNode;
};

export function IssueLabelFilterActionList({
  children,
}: IssueLabelFilterActionListProps) {
  // const [inputQuery, setInputQuery] = React.useState("");
  const alignRight = useMediaQuery(`(min-width: 768px)`);

  return (
    <ActionList
      items={[
        {
          items: [
            { title: "Unlabelled" },
            {
              color: "#a53ef5",
              title: "linear: next",
              description: "tracked issue",
            },
            {
              color: "#9a507e",
              title: "area: app",
              description: "app directory (appDir: true)",
            },
            {
              color: "#fddf99",
              title: "template: bug",
              description: "A user has filled out the bug report template",
            },
            {
              color: "#c2e0c6",
              title: "template: documentation",
            },
          ],
        },
      ]}
      renderItem={({
        selected,
        className,
        color,
        title,
        description,
        onCloseList,
      }) => (
        <Link
          prefetch={false}
          // @ts-ignore the href is a valid one
          href={
            `/issues?q=is:open+` + (color ? `label:"${title}"` : "no:label")
          }
          className={clsx(
            className,
            "flex items-center gap-4 hover:bg-neutral/50"
          )}
          onClick={onCloseList}
        >
          <div className="h-6 w-6 flex items-center justify-center px-2 flex-shrink-0">
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
              <strong className="font-semibold">{title}</strong>
              {description && <p className="text-grey">{description}</p>}
            </div>
          </div>
        </Link>
      )}
      align={alignRight ? "right" : "left"}
      title="Filter by label"
      header={
        <Input
          // value={inputQuery}
          // onChange={(e) => {
          //   setInputQuery(e.target.value);
          //   startTransition(async () => {
          //     await filterIssueAuthors(e.target.value).then(
          //       setFilteredDataList
          //     );
          //   });
          // }}
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
