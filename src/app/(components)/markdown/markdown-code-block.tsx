"use client";
import * as React from "react";
import { Button } from "~/app/(components)/button";
import { CheckIcon, CopyIcon } from "@primer/octicons-react";
import { clsx, wait } from "~/lib/shared/utils.shared";
import { Tooltip } from "~/app/(components)/tooltip";

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
    <div className="relative">
      {children}

      <Tooltip content="Copied!" side="left" isOpen={isPending}>
        <Button
          className={clsx(className, "transition duration-150")}
          variant="subtle"
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
