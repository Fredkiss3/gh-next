"use client";
import * as React from "react";

// components
import { Button } from "./button";

// utils
import { useFormStatus } from "react-dom";

// types
import type { BaseButtonProps, CommonButtonProps } from "./button";
import type { EventFor } from "~/lib/types";
export type SubmitButtonProps = CommonButtonProps &
  Omit<BaseButtonProps, "type" | "isLoading" | "loadingMessage"> & {
    loadingMessage: React.ReactNode;
  };

export function SubmitButton(props: SubmitButtonProps) {
  const status = useFormStatus();

  const { loadingMessage, ...restProps } = props;
  return (
    <Button
      {...restProps}
      type="submit"
      isLoading={status.pending}
      onClick={(e: EventFor<"button", "onClick">) => {
        if (status.pending) e.preventDefault();
      }}
    >
      {status.pending && loadingMessage ? loadingMessage : props.children}
    </Button>
  );
}
