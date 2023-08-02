"use client";
import * as React from "react";
import { useMediaQuery } from "~/lib/hooks/use-media-query";
import { ActionList } from "./action-list";
import { CheckIcon } from "@primer/octicons-react";
import { clsx } from "~/lib/shared-utils";
import Link from "next/link";

export type IssueSortActionListProps = {
  children: React.ReactNode;
};

export function IssueSortActionList({ children }: IssueSortActionListProps) {
  const alignRight = useMediaQuery(`(min-width: 768px)`);

  return (
    <ActionList
      items={[
        {
          items: [
            { title: "Newest", id: "created-desc" },
            { title: "Oldest", id: "created-asc" },
            { title: "Most commented", id: "comments-asc" },
            { title: "Least commented", id: "comments-desc" },
            { title: "Recently updated", id: "updated-desc" },
            { title: "Least recently updated", id: "updated-asc" },
            { title: "Best match", id: "releveance-desc" },
          ],
        },
        {
          header: {
            title: "Most reactions",
          },
          horizontal: true,
          items: [
            { emoji: true, title: "👍", id: "reactions-+1-desc" },
            { emoji: true, title: "👎", id: "reactions--1-desc" },
            { emoji: true, title: "😄", id: "reactions-smile-desc" },
            { emoji: true, title: "🎉", id: "reactions-tada-desc" },
            { emoji: true, title: "😕", id: "reactions-thinking_face-desc" },
            { emoji: true, title: "❤️", id: "reactions-heart-desc" },
            { emoji: true, title: "🚀", id: "reactions-rocket-desc" },
            { emoji: true, title: "👀", id: "reactions-eyes-desc" },
          ],
        },
      ]}
      renderItem={({ selected, className, title, id, onCloseList, emoji }) => (
        <Link
          prefetch={false}
          href={`/issues?q=is:open+sort:${id}`}
          className={clsx(className, "flex items-center gap-4", {
            "hover:bg-neutral/50": !emoji,
            "hover:bg-accent rounded-md p-2 justify-center": emoji,
          })}
          onClick={onCloseList}
        >
          {!emoji ? (
            <>
              <div className="h-6 w-6 flex items-center justify-center px-2 flex-shrink-0">
                {selected && <CheckIcon className="h-5 w-5 flex-shrink-0" />}
              </div>
              <span>{title}</span>
            </>
          ) : (
            <div>{title}</div>
          )}
        </Link>
      )}
      align={alignRight ? "right" : "left"}
      title="Sort by"
    >
      {children}
    </ActionList>
  );
}
