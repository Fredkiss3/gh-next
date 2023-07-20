"use client";
import * as React from "react";
import { Button } from "./button";
import { CheckIcon, CopyIcon } from "@primer/octicons-react";
import { clsx, wait } from "~/lib/functions";

export type CopyCodeButtonProps = {
  code: string;
  className?: string;
};

export function CopyCodeButton({ code, className }: CopyCodeButtonProps) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      className={className}
      variant="invisible"
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(code).then(() => {
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
  );
}
