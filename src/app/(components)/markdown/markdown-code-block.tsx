"use client";
import * as React from "react";
import { Button } from "../button";
import { CheckIcon, CopyIcon } from "@primer/octicons-react";
import { clsx, wait } from "~/lib/shared/utils.shared";
import { Tooltip } from "../tooltip";

export type MarkdownCodeBlockProps = {
  codeStr: string;
  children: React.ReactNode;
  className?: string;
};

export function MarkdownCodeBlock({
  codeStr,
  className,
  children
}: MarkdownCodeBlockProps) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <div className="group/code relative">
      {children}

      <Tooltip content="Copied!" placement="left" isOpen={isPending}>
        <Button
          className={clsx(className, "transition duration-150", {
            "opacity-0 group-hover/code:opacity-100": !isPending
          })}
          variant="invisible"
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(codeStr).then(() => {
              // show pending state (which is success state), until the user has stopped clicking the button
              startTransition(() => wait(1000));
            });
          }}
          isSquared
          renderLeadingIcon={(cls) =>
            isPending ? (
              <CheckIcon className={clsx(cls, "text-success")} />
            ) : (
              <CopyIcon className={cls} />
            )
          }
        />
      </Tooltip>
    </div>
  );
}
